/**
 * Health Insights Generator - Usage Examples
 * 
 * How to use generateHealthInsights() in your app
 */

import { getUserHealthData } from '@/lib/healthDataFetcher';
import { generateHealthInsights, getInsightIcon, getInsightColor } from '@/lib/healthInsightsGenerator';

// ========================================
// EXAMPLE 1: Basic Usage
// ========================================

async function BasicExample({ userId }) {
  // Get health data
  const healthData = await getUserHealthData(userId);
  
  // Generate insights
  const insights = await generateHealthInsights(healthData);
  
  console.log('Generated Insights:', insights);
  /* Output:
  [
    {
      type: "achievement",
      category: "adherence",
      message: "Fantastic! 95% medication adherence!",
      priority: 1
    },
    {
      type: "positive",
      category: "blood_pressure",
      message: "Blood pressure improved 5% this week!",
      priority: 2
    }
  ]
  */
  
  return insights;
}

// ========================================
// EXAMPLE 2: Display Insights in React
// ========================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, Heart } from 'lucide-react';

function InsightsDisplay({ userId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadInsights() {
      try {
        const healthData = await getUserHealthData(userId);
        const generated = await generateHealthInsights(healthData);
        setInsights(generated);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadInsights();
  }, [userId]);
  
  if (loading) return <div>Loading insights...</div>;
  
  return (
    <div className="space-y-3">
      {insights.map((insight, index) => {
        const Icon = getIconComponent(getInsightIcon(insight.type));
        const colorClass = getInsightColor(insight.type);
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-r ${colorClass} p-4 rounded-xl`}
          >
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5 text-white" />
              <p className="text-white">{insight.message}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function getIconComponent(iconName) {
  const icons = {
    sparkles: Sparkles,
    trending_up: TrendingUp,
    alert: AlertCircle,
    heart: Heart
  };
  return icons[iconName] || Heart;
}

// ========================================
// EXAMPLE 3: Filter Insights by Type
// ========================================

async function FilteredInsights({ userId }) {
  const healthData = await getUserHealthData(userId);
  const insights = await generateHealthInsights(healthData);
  
  // Get only positive insights
  const positiveInsights = insights.filter(i => 
    i.type === 'positive' || i.type === 'achievement' || i.type === 'improvement'
  );
  
  // Get only alerts
  const alerts = insights.filter(i => i.type === 'alert');
  
  console.log('Positive Insights:', positiveInsights.length);
  console.log('Alerts:', alerts.length);
  
  return { positiveInsights, alerts };
}

// ========================================
// EXAMPLE 4: Filter by Category
// ========================================

async function CategoryInsights({ userId }) {
  const healthData = await getUserHealthData(userId);
  const insights = await generateHealthInsights(healthData);
  
  // Group by category
  const byCategory = {
    adherence: insights.filter(i => i.category === 'adherence'),
    blood_pressure: insights.filter(i => i.category === 'blood_pressure'),
    glucose: insights.filter(i => i.category === 'glucose'),
    weight: insights.filter(i => i.category === 'weight'),
    sleep: insights.filter(i => i.category === 'sleep'),
    activity: insights.filter(i => i.category === 'activity'),
    overall: insights.filter(i => i.category === 'overall')
  };
  
  console.log('Insights by Category:', byCategory);
  
  return byCategory;
}

// ========================================
// EXAMPLE 5: Send as Push Notification
// ========================================

async function SendInsightNotifications({ userId }) {
  const healthData = await getUserHealthData(userId);
  const insights = await generateHealthInsights(healthData);
  
  // Send top priority insight as notification
  const topInsight = insights[0]; // Already sorted by priority
  
  if (Notification.permission === 'granted') {
    new Notification('Health Insight', {
      body: topInsight.message,
      icon: '/icon-192.png',
      tag: `insight-${topInsight.category}`
    });
  }
  
  return topInsight;
}

// ========================================
// EXAMPLE 6: Include in Email Summary
// ========================================

async function EmailSummary({ userId, userEmail }) {
  const healthData = await getUserHealthData(userId);
  const insights = await generateHealthInsights(healthData);
  
  const emailBody = `
    <h2>Your Weekly Health Insights</h2>
    <p>Hi! Here's what we noticed about your health this week:</p>
    
    <ul>
      ${insights.map(insight => `
        <li>
          <strong>${insight.type === 'alert' ? '⚠️' : '✅'}</strong>
          ${insight.message}
        </li>
      `).join('')}
    </ul>
    
    <p>Keep up the great work managing your health!</p>
  `;
  
  // Send email (pseudo-code)
  // await sendEmail(userEmail, 'Your Health Insights', emailBody);
  
  return emailBody;
}

// ========================================
// EXAMPLE 7: Store in Firestore
// ========================================

import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function SaveInsights({ userId }) {
  const healthData = await getUserHealthData(userId);
  const insights = await generateHealthInsights(healthData);
  
  // Save to Firestore for history
  await addDoc(collection(db, 'users', userId, 'insightHistory'), {
    insights,
    generatedAt: new Date().toISOString(),
    dataRange: healthData.dateRange
  });
  
  console.log('Insights saved to Firestore');
  
  return insights;
}

// ========================================
// EXAMPLE 8: Custom Fallback
// ========================================

async function InsightsWithCustomFallback({ userId }) {
  try {
    const healthData = await getUserHealthData(userId);
    const insights = await generateHealthInsights(healthData);
    
    return insights;
    
  } catch (error) {
    console.error('AI failed, using custom fallback:', error);
    
    // Custom fallback insights
    return [
      {
        type: 'neutral',
        category: 'overall',
        message: 'Keep logging your health data daily for personalized insights!',
        priority: 1
      },
      {
        type: 'positive',
        category: 'overall',
        message: "You're taking control of your health - great job!",
        priority: 2
      }
    ];
  }
}

// ========================================
// EXAMPLE 9: Combine with Charts
// ========================================

function InsightsDashboard({ userId }) {
  const [insights, setInsights] = useState([]);
  const [healthData, setHealthData] = useState(null);
  
  useEffect(() => {
    async function load() {
      const data = await getUserHealthData(userId);
      const generated = await generateHealthInsights(data);
      
      setHealthData(data);
      setInsights(generated);
    }
    
    load();
  }, [userId]);
  
  return (
    <div>
      {/* Display insights */}
      <section>
        <h2>AI Insights</h2>
        {insights.map((insight, i) => (
          <div key={i}>{insight.message}</div>
        ))}
      </section>
      
      {/* Display related charts */}
      <section>
        <h2>Health Trends</h2>
        {healthData && (
          <>
            <BloodPressureChart data={healthData.metricsByType.bloodPressure} />
            <GlucoseChart data={healthData.metricsByType.glucose} />
          </>
        )}
      </section>
    </div>
  );
}

// ========================================
// EXAMPLE 10: Refresh on Demand
// ========================================

function RefreshableInsights({ userId }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const refreshInsights = async () => {
    setLoading(true);
    
    try {
      const healthData = await getUserHealthData(userId);
      const generated = await generateHealthInsights(healthData);
      setInsights(generated);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button onClick={refreshInsights} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Insights'}
      </button>
      
      {insights.map((insight, i) => (
        <div key={i}>{insight.message}</div>
      ))}
    </div>
  );
}

// ========================================
// EXPORT ALL EXAMPLES
// ========================================

export {
  BasicExample,
  InsightsDisplay,
  FilteredInsights,
  CategoryInsights,
  SendInsightNotifications,
  EmailSummary,
  SaveInsights,
  InsightsWithCustomFallback,
  InsightsDashboard,
  RefreshableInsights
};
