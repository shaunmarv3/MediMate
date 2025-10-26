'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  Award, 
  Brain,
  Activity,
  ChevronRight,
  X
} from 'lucide-react';
import { getInsightsHistory, formatWeekId, getWeekDateRange } from '@/lib/insightsHistory';
import { format } from 'date-fns';

/**
 * InsightsHistorySidebar Component
 * 
 * Displays a scrollable sidebar showing past AI health summaries (weekly snapshots)
 * 
 * @param {string} userId - Current user's Firebase UID
 * @param {boolean} isOpen - Sidebar open state
 * @param {Function} onClose - Close sidebar callback
 */
export default function InsightsHistorySidebar({ userId, isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  useEffect(() => {
    if (userId && isOpen) {
      fetchHistory();
    }
  }, [userId, isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    
    try {
      const snapshots = await getInsightsHistory(userId, 12); // Last 12 weeks
      setHistory(snapshots);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      positive: TrendingUp,
      alert: AlertCircle,
      achievement: Award,
      improvement: Activity,
      neutral: Brain
    };
    return icons[type] || Brain;
  };

  const getTypeColor = (type) => {
    const colors = {
      positive: 'text-emerald-600 dark:text-emerald-400',
      alert: 'text-rose-600 dark:text-rose-400',
      achievement: 'text-purple-600 dark:text-purple-400',
      improvement: 'text-blue-600 dark:text-blue-400',
      neutral: 'text-slate-600 dark:text-slate-400'
    };
    return colors[type] || colors.neutral;
  };

  const getTypeBgColor = (type) => {
    const colors = {
      positive: 'bg-emerald-100 dark:bg-emerald-900/30',
      alert: 'bg-rose-100 dark:bg-rose-900/30',
      achievement: 'bg-purple-100 dark:bg-purple-900/30',
      improvement: 'bg-blue-100 dark:bg-blue-900/30',
      neutral: 'bg-slate-100 dark:bg-slate-700/30'
    };
    return colors[type] || colors.neutral;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:ml-64"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                      Insights History
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Weekly health summaries
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    No history yet
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Weekly summaries will appear here
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {history.map((snapshot, index) => {
                    const dateRange = getWeekDateRange(snapshot.weekId);
                    const isRecent = index === 0;

                    return (
                      <motion.div
                        key={snapshot.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedSnapshot(snapshot)}
                        className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        {/* Week Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatWeekId(snapshot.weekId)}
                            </span>
                            {isRecent && (
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                Latest
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Date Range */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
                        </p>

                        {/* Type Counts */}
                        {snapshot.typeCounts && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {Object.entries(snapshot.typeCounts).map(([type, count]) => {
                              const Icon = getTypeIcon(type);
                              const colorClass = getTypeColor(type);
                              const bgClass = getTypeBgColor(type);

                              return (
                                <div
                                  key={type}
                                  className={`flex items-center space-x-1 px-2 py-1 ${bgClass} rounded-full`}
                                >
                                  <Icon className={`w-3 h-3 ${colorClass}`} />
                                  <span className={`text-xs font-medium ${colorClass}`}>
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Key Phrases Preview */}
                        {snapshot.insights && snapshot.insights.length > 0 && (
                          <div className="space-y-2">
                            {snapshot.insights.slice(0, 2).map((insight, idx) => (
                              <div key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium">{insight.category?.replace('_', ' ')}:</span>{' '}
                                {insight.snippet}...
                              </div>
                            ))}
                            {snapshot.insights.length > 2 && (
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                +{snapshot.insights.length - 2} more insights
                              </p>
                            )}
                          </div>
                        )}

                        {/* Insights Count */}
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {snapshot.insightsCount} total insight{snapshot.insightsCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
              {selectedSnapshot && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white dark:bg-slate-800 z-10 overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Detail Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                          {formatWeekId(selectedSnapshot.weekId)}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {format(getWeekDateRange(selectedSnapshot.weekId).start, 'MMM d')} -{' '}
                          {format(getWeekDateRange(selectedSnapshot.weekId).end, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedSnapshot(null)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>

                    {/* Full Insights */}
                    <div className="space-y-3">
                      {selectedSnapshot.fullInsights?.map((insight, idx) => {
                        const Icon = getTypeIcon(insight.type);
                        const bgClass = getTypeBgColor(insight.type);
                        const colorClass = getTypeColor(insight.type);

                        return (
                          <div key={idx} className={`${bgClass} rounded-lg p-4`}>
                            <div className="flex items-start space-x-3">
                              <Icon className={`w-5 h-5 ${colorClass} mt-0.5`} />
                              <div className="flex-1">
                                <p className="text-sm text-slate-900 dark:text-white">
                                  {insight.message}
                                </p>
                                {insight.category && (
                                  <span className="inline-block mt-2 px-2 py-1 bg-white/50 dark:bg-black/20 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {insight.category.replace('_', ' ').toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
