'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function InteractionHistory() {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'drugInteractions'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInteractions(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-danger-100 dark:bg-danger-900/30',
          text: 'text-danger-700 dark:text-danger-300',
          chip: 'bg-danger-500',
          border: 'border-danger-300 dark:border-danger-700'
        };
      case 'Moderate':
        return {
          bg: 'bg-warning-100 dark:bg-warning-900/30',
          text: 'text-warning-700 dark:text-warning-300',
          chip: 'bg-warning-500',
          border: 'border-warning-300 dark:border-warning-700'
        };
      case 'Minor':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          chip: 'bg-blue-500',
          border: 'border-blue-300 dark:border-blue-700'
        };
      case 'None':
        return {
          bg: 'bg-success-100 dark:bg-success-900/30',
          text: 'text-success-700 dark:text-success-300',
          chip: 'bg-success-500',
          border: 'border-success-300 dark:border-success-700'
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          chip: 'bg-slate-500',
          border: 'border-slate-300 dark:border-slate-700'
        };
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No interaction checks yet
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Add medications to see interaction history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {interactions.map((interaction, index) => {
        const colors = getSeverityColor(interaction.severity);
        const timeAgo = interaction.timestamp 
          ? formatDistanceToNow(new Date(interaction.timestamp), { addSuffix: true })
          : 'Recently';

        return (
          <motion.div
            key={interaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-lg border ${colors.border} ${colors.bg} hover:shadow-md transition-all cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle className={`w-4 h-4 ${colors.text} shrink-0`} />
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {interaction.newDrug?.name || 'Unknown'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                  vs {interaction.existingDrugs?.length || 0} medication{(interaction.existingDrugs?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${colors.chip} shrink-0 mt-1 ring-2 ring-white dark:ring-slate-800`}></div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {interaction.severity}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{timeAgo}</span>
              </div>
            </div>

            {/* Tooltip on hover - optional */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2">
                {interaction.hasInteraction 
                  ? (interaction.explanation || 'Interaction detected')
                  : 'No interactions found - Safe to use together'
                }
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
