/**
 * Health Data Fetcher - Usage Examples
 * 
 * This demonstrates how to use getUserHealthData() utility
 * in your React components or API routes
 */

import { getUserHealthData, analyzeHealthTrends, getHealthSummary } from '@/lib/healthDataFetcher';

// ========================================
// EXAMPLE 1: Basic Usage in Component
// ========================================

async function ComponentExample({ userId }) {
  try {
    const healthData = await getUserHealthData(userId);
    
    console.log('✅ Health Data Retrieved:');
    console.log('- Total Metrics:', healthData.metrics.length);
    console.log('- Active Medications:', healthData.medications.length);
    console.log('- Adherence Rate:', healthData.adherenceStats.adherenceRate + '%');
    console.log('- Doses Taken:', healthData.adherenceStats.dosesTaken);
    console.log('- Missed Doses:', healthData.adherenceStats.missedDoses);
    
    return healthData;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// ========================================
// EXAMPLE 2: Get Organized Metrics by Type
// ========================================

async function GetMetricsByType({ userId }) {
  const healthData = await getUserHealthData(userId);
  
  // Access organized metrics
  const { metricsByType } = healthData;
  
  console.log('Blood Pressure readings:', metricsByType.bloodPressure.length);
  console.log('Glucose readings:', metricsByType.glucose.length);
  console.log('Weight readings:', metricsByType.weight.length);
  console.log('Heart Rate readings:', metricsByType.heartRate.length);
  console.log('Steps readings:', metricsByType.steps.length);
  console.log('Sleep readings:', metricsByType.sleepHours.length);
  
  // Example: Get latest blood pressure
  if (metricsByType.bloodPressure.length > 0) {
    const latestBP = metricsByType.bloodPressure[0];
    console.log('Latest BP:', latestBP.value, 'at', latestBP.timestamp);
  }
  
  return metricsByType;
}

// ========================================
// EXAMPLE 3: Analyze Health Trends
// ========================================

async function AnalyzeTrends({ userId }) {
  const healthData = await getUserHealthData(userId);
  const trends = analyzeHealthTrends(healthData);
  
  console.log('📊 HEALTH TRENDS:');
  console.log('Adherence Rate:', trends.adherenceRate + '%');
  console.log('Adherence Grade:', trends.adherenceGrade);
  console.log('Total Data Points:', trends.totalDataPoints);
  console.log('Active Days:', trends.activeDays);
  
  // Check each metric trend
  Object.entries(trends.trends).forEach(([metric, data]) => {
    console.log(`\n${metric}:`);
    console.log('  Direction:', data.direction);
    console.log('  Change:', data.percentageChange + '%');
    console.log('  Recent Avg:', data.recentAverage);
    console.log('  Previous Avg:', data.previousAverage);
  });
  
  return trends;
}

// ========================================
// EXAMPLE 4: Quick Health Summary
// ========================================

async function GetQuickSummary({ userId }) {
  const summary = await getHealthSummary(userId);
  
  console.log('🏥 QUICK HEALTH SUMMARY:');
  console.log('Adherence:', summary.adherenceRate + '%', `(${summary.adherenceGrade})`);
  console.log('Active Medications:', summary.activeMedications);
  console.log('Total Metrics:', summary.totalMetrics);
  console.log('Last 30 Days:');
  console.log('  - Doses Taken:', summary.last30Days.dosesTaken);
  console.log('  - Missed Doses:', summary.last30Days.missedDoses);
  console.log('  - Active Days:', summary.last30Days.activeDays);
  
  return summary;
}

// ========================================
// EXAMPLE 5: Daily Aggregates
// ========================================

async function GetDailyAggregates({ userId }) {
  const healthData = await getUserHealthData(userId);
  const { dailyMetrics } = healthData;
  
  console.log('📅 DAILY METRICS:');
  
  Object.entries(dailyMetrics).forEach(([date, data]) => {
    console.log(`\n${date}:`);
    
    if (data.averages) {
      Object.entries(data.averages).forEach(([type, avg]) => {
        if (type === 'bp') {
          console.log(`  BP: ${avg.systolic}/${avg.diastolic} (${avg.count} readings)`);
        } else {
          console.log(`  ${type}: ${avg.average} (range: ${avg.min}-${avg.max})`);
        }
      });
    }
  });
  
  return dailyMetrics;
}

// ========================================
// EXAMPLE 6: Use in React Component
// ========================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

export function HealthDashboard() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadHealthData() {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getUserHealthData(user.uid);
        setHealthData(data);
      } catch (error) {
        console.error('Failed to load health data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadHealthData();
  }, [user]);
  
  if (loading) return <div>Loading...</div>;
  if (!healthData) return <div>No data</div>;
  
  return (
    <div>
      <h1>Health Dashboard</h1>
      <p>Adherence: {healthData.adherenceStats.adherenceRate}%</p>
      <p>Medications: {healthData.medications.length}</p>
      <p>Metrics: {healthData.metrics.length}</p>
    </div>
  );
}

// ========================================
// EXAMPLE 7: Generate AI Insights
// ========================================

async function GenerateAIInsights({ userId }) {
  const healthData = await getUserHealthData(userId);
  const trends = analyzeHealthTrends(healthData);
  
  // Build context for AI
  const context = {
    adherence: healthData.adherenceStats.adherenceRate,
    adherenceGrade: trends.adherenceGrade,
    medications: healthData.medications.map(m => ({
      name: m.name,
      dosage: m.dosage
    })),
    trends: trends.trends,
    activeDays: trends.activeDays,
    totalMetrics: healthData.metrics.length
  };
  
  console.log('🤖 Context for AI:', context);
  
  // Send to Gemini AI (example - actual implementation in HealthInsights.js)
  // const insights = await callGeminiAI(context);
  
  return context;
}

// ========================================
// EXAMPLE 8: Export Health Report Data
// ========================================

async function PrepareHealthReport({ userId }) {
  const healthData = await getUserHealthData(userId);
  const trends = analyzeHealthTrends(healthData);
  
  const report = {
    generatedDate: new Date().toISOString(),
    dateRange: healthData.dateRange,
    patient: {
      medications: healthData.medications.length,
      adherence: {
        rate: healthData.adherenceStats.adherenceRate + '%',
        grade: trends.adherenceGrade,
        dosesTaken: healthData.adherenceStats.dosesTaken,
        totalExpected: healthData.adherenceStats.totalExpectedDoses
      }
    },
    metrics: {
      totalReadings: healthData.metrics.length,
      activeDays: trends.activeDays,
      byType: Object.entries(healthData.metricsByType).map(([type, data]) => ({
        type,
        readings: data.length,
        trend: trends.trends[type]
      }))
    },
    medications: healthData.medications.map(m => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.schedule?.length + 'x daily',
      startDate: m.startDate
    }))
  };
  
  console.log('📄 HEALTH REPORT:', report);
  
  return report;
}

// ========================================
// EXPORT ALL EXAMPLES
// ========================================

export {
  ComponentExample,
  GetMetricsByType,
  AnalyzeTrends,
  GetQuickSummary,
  GetDailyAggregates,
  HealthDashboard,
  GenerateAIInsights,
  PrepareHealthReport
};
