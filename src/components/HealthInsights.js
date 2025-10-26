'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Heart, Award, Activity, Brain, RefreshCw, History } from 'lucide-react';

/**
 * HealthInsights Component
 * 
 * Displays AI-generated health insights with beautiful gradient cards
 * 
 * @param {Array} insights - Array of insight objects from Gemini API
 * @param {boolean} loading - Loading state
 * @param {Function} onRefresh - Optional callback to refresh insights
 * @param {Function} onOpenHistory - Optional callback to open history sidebar
 * @param {string} cacheAge - Optional cache age display (e.g., "2 days ago")
 * 
 * Insight object structure:
 * {
 *   type: 'positive' | 'alert' | 'neutral' | 'achievement' | 'improvement',
 *   category: string,
 *   message: string,
 *   priority: number
 * }
 */
export default function HealthInsights({ insights = [], loading = false, onRefresh, onOpenHistory, cacheAge }) {

  /**
   * Get icon component based on insight type
   */
  const getIcon = (type) => {
    const iconMap = {
      positive: TrendingUp,
      alert: AlertCircle,
      neutral: Brain,
      achievement: Award,
      improvement: Activity,
    };
    return iconMap[type] || Heart;
  };

  /**
   * Get gradient classes based on insight type
   */
  const getGradientColors = (type) => {
    const gradients = {
      positive: 'from-emerald-500 via-teal-500 to-cyan-500',
      alert: 'from-rose-500 via-pink-500 to-red-500',
      neutral: 'from-slate-500 via-gray-500 to-zinc-500',
      achievement: 'from-purple-500 via-fuchsia-500 to-pink-500',
      improvement: 'from-blue-500 via-indigo-500 to-violet-500',
    };
    return gradients[type] || gradients.neutral;
  };

  /**
   * Loading skeleton component
   */
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-slate-200 dark:bg-slate-700 rounded-xl p-4 animate-pulse"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-slate-300 dark:bg-slate-600 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-3/4" />
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-full" />
              <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              🧠 AI Health Insights
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {cacheAge ? `Updated ${cacheAge}` : 'Personalized insights powered by AI'}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {/* History button */}
          {onOpenHistory && !loading && (
            <button
              onClick={onOpenHistory}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="View history"
            >
              <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          
          {/* Refresh button */}
          {onRefresh && !loading && (
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Refresh insights"
            >
              <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : insights.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            No insights available yet. Keep logging your health data!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {insights.map((insight, index) => {
              const Icon = getIcon(insight.type);
              const gradientColors = getGradientColors(insight.type);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.4,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-r ${gradientColors} rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow cursor-default`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base leading-relaxed font-medium">
                        {insight.message}
                      </p>
                      
                      {/* Category badge */}
                      {insight.category && (
                        <span className="inline-block mt-2 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                          {insight.category.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer note */}
      {!loading && insights.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center"
        >
          💡 Insights are generated based on your last 30 days of health data
        </motion.p>
      )}
    </motion.div>
  );
}
