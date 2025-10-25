'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Pill, Plus, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    startDate: new Date().toISOString().split('T')[0],
    instructions: '',
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'medications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedications(meds);
    });

    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const schedule = formData.times.map(time => ({
        time,
        repeat: 'daily'
      }));

      await addDoc(collection(db, 'users', user.uid, 'medications'), {
        name: formData.name,
        dosage: formData.dosage,
        schedule,
        startDate: formData.startDate,
        endDate: null,
        instructions: formData.instructions,
        createdAt: new Date().toISOString(),
      });

      toast.success('Medication added successfully!');
      setShowForm(false);
      setFormData({
        name: '',
        dosage: '',
        times: ['08:00'],
        startDate: new Date().toISOString().split('T')[0],
        instructions: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '12:00']
    });
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
            className="card p-8 mb-8"
          >
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Add New Medication
            </h2>
            
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
              className="card p-6 hover:shadow-medium transition-all"
            >
              <div className="flex items-start justify-between mb-4">
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
                {med.schedule?.slice(0, 2).map((s, i) => (
                  <div key={i} className="text-slate-500 dark:text-slate-400 ml-6">
                    {s.time}
                  </div>
                ))}
                {med.instructions && (
                  <p className="text-slate-500 dark:text-slate-400 italic mt-3">
                    {med.instructions}
                  </p>
                )}
              </div>
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
