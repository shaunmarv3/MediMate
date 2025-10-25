'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Pill, Plus, Clock, Calendar, X, Trash2, Bell, BellOff, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission, scheduleLocalNotification, getUpcomingDosesForToday } from '@/lib/notifications';
import { calculateAndStoreAdherence } from '@/lib/adherenceCalculator';

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [takenToday, setTakenToday] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    instructions: '',
  });

  useEffect(() => {
    if (!user) return;

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Fetch today's medication intake logs
    const fetchTodayIntake = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const intakeQuery = query(
        collection(db, 'users', user.uid, 'medicationIntake'),
        where('date', '==', todayStr)
      );

      const snapshot = await getDocs(intakeQuery);
      const intakeMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        intakeMap[data.medicationId] = true;
      });
      setTakenToday(intakeMap);
    };

    fetchTodayIntake();

    const q = query(
      collection(db, 'users', user.uid, 'medications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter out expired medications and delete them
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      meds.forEach((med) => {
        if (med.endDate) {
          const endDate = new Date(med.endDate);
          endDate.setHours(23, 59, 59, 999);

          if (endDate < today) {
            // Delete expired medication
            deleteDoc(doc(db, 'users', user.uid, 'medications', med.id));
          }
        }
      });

      // Set only active medications
      const activeMeds = meds.filter((med) => {
        if (med.endDate) {
          const endDate = new Date(med.endDate);
          endDate.setHours(23, 59, 59, 999);
          return endDate >= today;
        }
        return true;
      });

      setMedications(activeMeds);

      // Schedule notifications for today's upcoming doses
      if (notificationPermission === 'granted') {
        const upcomingDoses = getUpcomingDosesForToday(activeMeds);
        upcomingDoses.forEach((dose) => {
          scheduleLocalNotification(dose.medicationName, dose.instructions, dose.scheduledTime);
        });
      }
    });

    return unsubscribe;
  }, [user, notificationPermission]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Request notification permission
    const token = await requestNotificationPermission();

    if (!token && Notification.permission === 'denied') {
      toast.error('Notification permission denied. Please enable notifications to add medications.', {
        duration: 5000
      });
      return;
    }

    if (token) {
      setNotificationPermission('granted');
      toast.success('Notifications enabled!');
    }

    setLoading(true);

    try {
      const schedule = formData.times.map(time => ({
        time,
        repeat: 'daily'
      }));

      const medicationData = {
        name: formData.name,
        dosage: formData.dosage,
        schedule,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        instructions: formData.instructions,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'users', user.uid, 'medications'), medicationData);

      toast.success('Medication added successfully with notifications!');

      // Schedule notifications for this medication
      if (notificationPermission === 'granted') {
        const today = new Date();
        schedule.forEach((scheduleItem) => {
          const [hours, minutes] = scheduleItem.time.split(':');
          const scheduleTime = new Date(today);
          scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          scheduleLocalNotification(formData.name, formData.instructions, scheduleTime.toISOString());
        });
      }

      setShowForm(false);
      setFormData({
        name: '',
        dosage: '',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        instructions: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (medId, medName) => {
    if (confirm(`Are you sure you want to delete ${medName}?`)) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'medications', medId));
        toast.success('Medication deleted successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete medication');
      }
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '12:00']
    });
  };

  const markAsTaken = async (medId, medName) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Check if already taken today
      if (takenToday[medId]) {
        toast.info('Already marked as taken for today');
        return;
      }

      // Log the medication intake
      await addDoc(collection(db, 'users', user.uid, 'medicationIntake'), {
        medicationId: medId,
        medicationName: medName,
        date: todayStr,
        timestamp: new Date().toISOString(),
        taken: true
      });

      // Update local state
      setTakenToday(prev => ({ ...prev, [medId]: true }));
      toast.success(`${medName} marked as taken!`);

      // Calculate and store updated adherence rate
      await calculateAndStoreAdherence(user.uid);
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark medication as taken');
    }
  };

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
              Medications
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your medication schedule
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medication</span>
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 mb-8 relative"
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>

            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Add New Medication
            </h2>

            {/* Notification Permission Info */}
            {notificationPermission !== 'granted' && (
              <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl flex items-start space-x-3">
                <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cyan-900 dark:text-cyan-200 mb-1">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-cyan-800 dark:text-cyan-300">
                    We'll request permission to send you medication reminders when you add this medication.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Medication Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>
                <div>
                  <label className="label">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 10mg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Schedule Times</label>
                <div className="space-y-3">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...formData.times];
                          newTimes[index] = e.target.value;
                          setFormData({ ...formData, times: newTimes });
                        }}
                        className="input-field flex-1"
                        required
                      />
                      {formData.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              times: formData.times.filter((_, i) => i !== index)
                            });
                          }}
                          className="text-danger-600 dark:text-danger-400 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="text-primary-600 dark:text-primary-400 hover:underline text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add another time</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    min={formData.startDate}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Medication will be auto-deleted after this date
                  </p>
                </div>
              </div>

              <div>
                <label className="label">Instructions (Optional)</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Take with food"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Adding...' : 'Add Medication'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-medium transition-all relative"
            >
              <button
                onClick={() => handleDelete(med.id, med.name)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors group"
                aria-label="Delete medication"
              >
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-danger-600 dark:group-hover:text-danger-400" />
              </button>

              <div className="flex items-start justify-between mb-4 pr-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <Pill className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {med.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {med.dosage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{med.schedule?.length || 0}x daily</span>
                </div>
                {med.schedule?.slice(0, 2).map((s, i) => {
                  // Convert 24h to 12h format with AM/PM
                  const [hours, minutes] = s.time.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 || 12;
                  const displayTime = `${displayHour}:${minutes} ${ampm}`;

                  return (
                    <div key={i} className="text-slate-500 dark:text-slate-400 ml-6">
                      {displayTime}
                    </div>
                  );
                })}
                {med.endDate && (
                  <div className="flex items-center space-x-2 text-warning-600 dark:text-warning-400 mt-3">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Ends: {new Date(med.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                {med.instructions && (
                  <p className="text-slate-500 dark:text-slate-400 italic mt-3">
                    {med.instructions}
                  </p>
                )}
              </div>

              {/* Mark as Taken Button */}
              <button
                onClick={() => markAsTaken(med.id, med.name)}
                disabled={takenToday[med.id]}
                className={`w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                  takenToday[med.id]
                    ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md'
                }`}
              >
                {takenToday[med.id] ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Taken Today</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5" />
                    <span>Mark as Taken</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}

          {medications.length === 0 && !showForm && (
            <div className="col-span-full card p-12 text-center">
              <Pill className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No medications yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start by adding your first medication
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Medication
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
