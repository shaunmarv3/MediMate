'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Bell, Download, Trash2, Shield } from 'lucide-react';
import { format } from 'date-fns';

export default function SettingsPage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    push: false,
  });

  useEffect(() => {
    if (userData?.notificationPrefs) {
      setNotifPrefs(userData.notificationPrefs);
    }
  }, [userData]);

  const handleNotifUpdate = async (key, value) => {
    const newPrefs = { ...notifPrefs, [key]: value };
    setNotifPrefs(newPrefs);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        notificationPrefs: newPrefs,
      });
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update preferences');
    }
  };

  const exportData = async () => {
    setLoading(true);
    try {
      // Fetch all user data
      const metricsSnapshot = await getDocs(collection(db, 'users', user.uid, 'metrics'));
      const medicationsSnapshot = await getDocs(collection(db, 'users', user.uid, 'medications'));

      const metrics = metricsSnapshot.docs.map(doc => doc.data());
      const medications = medicationsSnapshot.docs.map(doc => doc.data());

      // Create CSV
      let csv = 'Type,Date,Value,Note\n';
      
      metrics.forEach(m => {
        const value = typeof m.value === 'object' 
          ? `${m.value.systolic}/${m.value.diastolic}` 
          : m.value;
        csv += `${m.type},${m.timestamp},${value},"${m.note || ''}"\n`;
      });

      csv += '\n\nMedication,Dosage,Schedule,Start Date\n';
      medications.forEach(m => {
        csv += `${m.name},${m.dosage},"${m.schedule?.map(s => s.time).join(', ')}",${m.startDate}\n`;
      });

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medimate-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your app preferences and data
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Configure how you receive medication reminders
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Email Reminders</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive medication reminders via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPrefs.email}
                    onChange={(e) => handleNotifUpdate('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive browser push notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifPrefs.push}
                    onChange={(e) => handleNotifUpdate('push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                <Download className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Export Data
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Download all your health data as CSV
                </p>
              </div>
            </div>

            <button
              onClick={exportData}
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>{loading ? 'Exporting...' : 'Export All Data'}</span>
            </button>
          </div>

          {/* Privacy */}
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Privacy & Security
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your data is encrypted and secure
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              MediMate uses industry-standard encryption to protect your health data. 
              We never share your information with third parties. You have full control over your data.
            </p>

            <a href="/help" className="text-primary-600 dark:text-primary-400 hover:underline text-sm">
              Learn more about our privacy practices →
            </a>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border-2 border-danger-200 dark:border-danger-800">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-danger-100 dark:bg-danger-900/30 rounded-xl">
                <Trash2 className="w-6 h-6 text-danger-600 dark:text-danger-400" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-danger-900 dark:text-danger-200">
                  Danger Zone
                </h2>
                <p className="text-sm text-danger-700 dark:text-danger-400">
                  Irreversible actions
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Deleting your account will permanently remove all your health data, medications, and account information. This action cannot be undone.
            </p>

            <button
              onClick={() => toast.error('Account deletion is not yet implemented')}
              className="bg-danger-600 hover:bg-danger-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all duration-200"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
