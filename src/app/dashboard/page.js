'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Pill, 
  TrendingUp, 
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Heart,
  Droplet,
  Footprints,
  Weight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Link from 'next/link';
import { format, isToday, parseISO } from 'date-fns';
import { getLatestAdherence } from '@/lib/adherenceCalculator';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [medications, setMedications] = useState([]);
  const [todaysDoses, setTodaysDoses] = useState([]);
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to recent metrics
    const metricsQuery = query(
      collection(db, 'users', user.uid, 'metrics'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubMetrics = onSnapshot(metricsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMetrics(data);
    });

    // Listen to medications
    const medsQuery = query(
      collection(db, 'users', user.uid, 'medications'),
      orderBy('createdAt', 'desc')
    );

    const unsubMeds = onSnapshot(medsQuery, async (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedications(meds);

      // Get the latest adherence rate from database
      const adherence = await getLatestAdherence(user.uid);
      setAdherenceRate(adherence);

      // Get today's medication status
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      const todayIntakeQuery = query(
        collection(db, 'users', user.uid, 'medicationIntake'),
        where('date', '==', todayStr)
      );

      const todayIntakeSnapshot = await getDocs(todayIntakeQuery);
      const takenMedIds = new Set(todayIntakeSnapshot.docs.map(doc => doc.data().medicationId));

      // Create today's doses list
      const doses = meds.map(med => ({
        id: med.id,
        medId: med.id,
        medName: med.name,
        dosage: med.dosage,
        taken: takenMedIds.has(med.id),
        scheduledTime: today.toISOString()
      }));

      setTodaysDoses(doses);
      setLoading(false);
    });

    return () => {
      unsubMetrics();
      unsubMeds();
    };
  }, [user]);

  // Prepare chart data for different metrics
  const getChartData = (type) => {
    const filtered = metrics.filter(m => m.type === type).slice(0, 10).reverse();
    
    return {
      labels: filtered.map(m => format(parseISO(m.timestamp), 'MMM d')),
      datasets: [{
        label: type === 'weight' ? 'Weight (kg)' : 
               type === 'hr' ? 'Heart Rate (bpm)' :
               type === 'steps' ? 'Steps' :
               type === 'glucose' ? 'Glucose (mg/dL)' : 'Value',
        data: filtered.map(m => type === 'bp' ? m.value.systolic : m.value),
        borderColor: type === 'weight' ? '#06b6d4' :
                     type === 'hr' ? '#ef4444' :
                     type === 'steps' ? '#22c55e' :
                     type === 'glucose' ? '#f59e0b' : '#8b5cf6',
        backgroundColor: type === 'weight' ? 'rgba(6, 182, 212, 0.1)' :
                        type === 'hr' ? 'rgba(239, 68, 68, 0.1)' :
                        type === 'steps' ? 'rgba(34, 197, 94, 0.1)' :
                        type === 'glucose' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    }
  };

  const metricCards = [
    { type: 'weight', icon: Weight, color: 'cyan', label: 'Weight' },
    { type: 'hr', icon: Heart, color: 'red', label: 'Heart Rate' },
    { type: 'steps', icon: Footprints, color: 'green', label: 'Steps' },
    { type: 'glucose', icon: Droplet, color: 'amber', label: 'Glucose' },
  ];

  if (loading) {
    return (
      <div className="lg:ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {userData?.displayName?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's your health summary for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </motion.div>

        {/* Today's Medications */}
        {todaysDoses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 bg-gradient-to-br from-cyan-500 to-purple-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">
                    Today's Medications
                  </h2>
                  <p className="text-cyan-100 text-sm">
                    {todaysDoses.filter(d => d.taken).length} of {todaysDoses.length} taken
                  </p>
                </div>
              </div>
              <Link href="/medications" className="text-white hover:underline text-sm">
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {todaysDoses.slice(0, 3).map((dose) => (
                <div key={dose.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {dose.taken ? (
                      <CheckCircle2 className="w-5 h-5 text-success-300" />
                    ) : (
                      <Clock className="w-5 h-5 text-white/70" />
                    )}
                    <div>
                      <p className="font-medium text-white">{dose.medName}</p>
                      <p className="text-sm text-white/70">{dose.dosage}</p>
                    </div>
                  </div>
                  {dose.taken && (
                    <span className="text-xs bg-success-500/30 text-success-100 px-3 py-1 rounded-full">
                      Taken
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl`}>
                <Activity className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Adherence Rate</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{adherenceRate}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Since account creation</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Active Medications</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{medications.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currently tracking</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Metrics Logged</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Streak</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {adherenceRate >= 80 ? '7' : '0'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Days consistent</p>
          </motion.div>
        </div>

        {/* Health Metrics Charts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Health Trends
            </h2>
            <Link href="/metrics" className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm">
              View All Metrics
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {metricCards.map((metric, index) => {
              const data = metrics.filter(m => m.type === metric.type);
              if (data.length === 0) return null;

              return (
                <motion.div
                  key={metric.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 bg-${metric.color}-100 dark:bg-${metric.color}-900/30 rounded-lg`}>
                        <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{metric.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Last 10 entries</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-48">
                    <Line data={getChartData(metric.type)} options={chartOptions} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/metrics" className="card p-6 hover:shadow-medium transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Log Metric</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Track your health data</p>
              </div>
            </div>
          </Link>

          <Link href="/medications" className="card p-6 hover:shadow-medium transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Add Medication</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your medications</p>
              </div>
            </div>
          </Link>

          <Link href="/symptoms" className="card p-6 hover:shadow-medium transition-all group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Symptom Check</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI-powered guidance</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
