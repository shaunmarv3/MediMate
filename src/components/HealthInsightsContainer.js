'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { getUserHealthData } from '@/lib/healthDataFetcher';
import { generateHealthInsights } from '@/lib/healthInsightsGenerator';
import HealthInsights from './HealthInsights';

/**
 * HealthInsightsContainer - Data fetching wrapper
 * 
 * Fetches health data and generates AI insights, then passes to HealthInsights component
 * 
 * @param {string} userId - Current user's ID
 * @param {Function} onRefresh - Optional callback when insights are refreshed
 */
export default function HealthInsightsContainer({ userId, onRefresh }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchInsights();
    }
  }, [userId]);

  const fetchInsights = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch comprehensive 30-day health data
      const healthData = await getUserHealthData(userId);

      // Generate AI insights using Gemini API
      const generatedInsights = await generateHealthInsights(healthData);

      setInsights(generatedInsights);
      setLastUpdated(new Date());
      
      // Call optional refresh callback
      if (onRefresh) {
        onRefresh(generatedInsights);
      }

    } catch (error) {
      console.error('Error generating insights:', error);
      
      // Set fallback insight
      setInsights([
        {
          type: 'neutral',
          category: 'general',
          message: 'Keep logging your health data to unlock personalized insights!',
          priority: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Refresh button (optional) */}
      {!loading && (
        <button
          onClick={fetchInsights}
          className="absolute top-6 right-6 z-10 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      )}

      {/* Main component */}
      <HealthInsights insights={insights} loading={loading} />

      {/* Last updated timestamp */}
      {lastUpdated && !loading && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
