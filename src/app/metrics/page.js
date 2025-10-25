'use client';

import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { Weight, Heart, Footprints, Droplet, Activity, Upload, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MetricsPage() {
  const { user } = useAuth();
  const [metricType, setMetricType] = useState('weight');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    systolic: '',
    diastolic: '',
    steps: '',
    glucose: '',
    heartRate: '',
    note: '',
  });
  const [image, setImage] = useState(null);

  const metricTypes = [
    { id: 'weight', label: 'Weight', icon: Weight, unit: 'kg', color: 'primary' },
    { id: 'bp', label: 'Blood Pressure', icon: Heart, unit: 'mmHg', color: 'danger' },
    { id: 'steps', label: 'Steps', icon: Footprints, unit: 'steps', color: 'success' },
    { id: 'glucose', label: 'Blood Glucose', icon: Droplet, unit: 'mg/dL', color: 'warning' },
    { id: 'hr', label: 'Heart Rate', icon: Activity, unit: 'bpm', color: 'secondary' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      
      if (image) {
        const storageRef = ref(storage, `users/${user.uid}/metrics/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const metricData = {
        type: metricType,
        timestamp: new Date().toISOString(),
        note: formData.note,
        imageUrl,
      };

      if (metricType === 'weight') {
        metricData.value = parseFloat(formData.weight);
      } else if (metricType === 'bp') {
        metricData.value = {
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
        };
      } else if (metricType === 'steps') {
        metricData.value = parseInt(formData.steps);
      } else if (metricType === 'glucose') {
        metricData.value = parseFloat(formData.glucose);
      } else if (metricType === 'hr') {
        metricData.value = parseInt(formData.heartRate);
      }

      await addDoc(collection(db, 'users', user.uid, 'metrics'), metricData);
      
      toast.success('Metric logged successfully!');
      
      // Reset form
      setFormData({
        weight: '',
        systolic: '',
        diastolic: '',
        steps: '',
        glucose: '',
        heartRate: '',
        note: '',
      });
      setImage(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to log metric');
    } finally {
      setLoading(false);
    }
  };

  const currentMetric = metricTypes.find(m => m.id === metricType);

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Log Health Metric
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your vital health measurements
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {metricTypes.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setMetricType(metric.id)}
              className={`card p-4 text-center hover:shadow-medium transition-all ${
                metricType === metric.id
                  ? `bg-${metric.color}-50 dark:bg-${metric.color}-900/20 border-2 border-${metric.color}-500`
                  : ''
              }`}
            >
              <metric.icon className={`w-8 h-8 mx-auto mb-2 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              <p className="text-sm font-medium text-slate-900 dark:text-white">{metric.label}</p>
            </button>
          ))}
        </div>

        <motion.div
          key={metricType}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 bg-${currentMetric.color}-100 dark:bg-${currentMetric.color}-900/30 rounded-xl`}>
              <currentMetric.icon className={`w-6 h-6 text-${currentMetric.color}-600 dark:text-${currentMetric.color}-400`} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                {currentMetric.label}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your {currentMetric.label.toLowerCase()} reading
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {metricType === 'weight' && (
              <div>
                <label className="label">Weight ({currentMetric.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input-field"
                  placeholder="75.5"
                  required
                />
              </div>
            )}

            {metricType === 'bp' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Systolic</label>
                  <input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    className="input-field"
                    placeholder="120"
                    required
                  />
                </div>
                <div>
                  <label className="label">Diastolic</label>
                  <input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    className="input-field"
                    placeholder="80"
                    required
                  />
                </div>
              </div>
            )}

            {metricType === 'steps' && (
              <div>
                <label className="label">Steps</label>
                <input
                  type="number"
                  value={formData.steps}
                  onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                  className="input-field"
                  placeholder="10000"
                  required
                />
              </div>
            )}

            {metricType === 'glucose' && (
              <div>
                <label className="label">Glucose ({currentMetric.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.glucose}
                  onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                  className="input-field"
                  placeholder="100"
                  required
                />
              </div>
            )}

            {metricType === 'hr' && (
              <div>
                <label className="label">Heart Rate ({currentMetric.unit})</label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  className="input-field"
                  placeholder="72"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Note (Optional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="input-field"
                placeholder="Add any notes about this reading..."
                rows={3}
              />
            </div>

            <div>
              <label className="label">Upload Image (Optional)</label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {image ? image.name : 'Click to upload image'}
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{loading ? 'Logging...' : 'Log Metric'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
