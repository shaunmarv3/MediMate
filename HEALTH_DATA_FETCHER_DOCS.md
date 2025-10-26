# 📊 Health Data Fetcher Utility - Complete Documentation

## Overview

A comprehensive utility function that fetches and analyzes user health data from Firestore for the last 30 days, including:
- ✅ Health metrics (blood pressure, glucose, weight, heart rate, steps, sleep, oxygen)
- ✅ Medication adherence logs
- ✅ Trend analysis
- ✅ Daily aggregates
- ✅ Adherence statistics

---

## 📁 Files Created

### 1. `src/lib/healthDataFetcher.js` (Main Utility)
Complete implementation with 3 public functions:
- `getUserHealthData(userId)` - Fetch all health data
- `analyzeHealthTrends(healthData)` - Analyze trends
- `getHealthSummary(userId)` - Quick summary

### 2. `src/lib/healthDataFetcher.examples.js` (Usage Examples)
8 real-world examples showing how to use the utility

### 3. `src/components/HealthInsights.js` (Updated)
Now uses the new utility for better data analysis

---

## 🚀 Quick Start

```javascript
import { getUserHealthData } from '@/lib/healthDataFetcher';

// In your component or API route
const healthData = await getUserHealthData(userId);

console.log(healthData);
// Returns comprehensive health data object
```

---

## 📦 What You Get

### Return Object Structure:

```javascript
{
  // Raw metrics array (last 30 days)
  metrics: [
    {
      id: "metric123",
      type: "weight",
      value: 75,
      timestamp: "2025-10-26T10:00:00.000Z",
      note: "Morning weigh-in"
    },
    // ... more metrics
  ],

  // Organized by type for easy access
  metricsByType: {
    bloodPressure: [
      { value: {systolic: 120, diastolic: 80}, timestamp: "..." }
    ],
    glucose: [
      { value: 95, timestamp: "..." }
    ],
    weight: [...],
    heartRate: [...],
    steps: [...],
    sleepHours: [...],
    oxygen: [...]
  },

  // Daily aggregates with averages
  dailyMetrics: {
    "2025-10-26": {
      date: "2025-10-26",
      metrics: {
        weight: [75, 75.2],
        hr: [72, 68, 70]
      },
      averages: {
        weight: {
          average: 75.1,
          count: 2,
          min: 75,
          max: 75.2
        },
        hr: {
          average: 70,
          count: 3,
          min: 68,
          max: 72
        }
      }
    },
    // ... more days
  },

  // Active medications
  medications: [
    {
      id: "med123",
      name: "Lisinopril",
      dosage: "10mg",
      schedule: [{time: "08:00", repeat: "daily"}],
      startDate: "2025-09-01",
      // ... more fields
    }
  ],

  // Medication intake logs
  adherenceLogs: [
    {
      id: "log123",
      medicationId: "med123",
      medicationName: "Lisinopril",
      date: "2025-10-26",
      timestamp: "2025-10-26T08:05:00.000Z",
      taken: true
    }
  ],

  // Calculated statistics
  adherenceStats: {
    totalExpectedDoses: 60,      // Expected in 30 days
    dosesTaken: 57,               // Actually taken
    missedDoses: 3,               // Missed doses
    adherenceRate: 95,            // Percentage
    logsCount: 57                 // Total logs
  },

  // Date range info
  dateRange: {
    startDate: "2025-09-26T00:00:00.000Z",
    endDate: "2025-10-26T23:59:59.000Z",
    days: 30
  }
}
```

---

## 📈 Analyzing Trends

```javascript
import { getUserHealthData, analyzeHealthTrends } from '@/lib/healthDataFetcher';

const healthData = await getUserHealthData(userId);
const trends = analyzeHealthTrends(healthData);

console.log(trends);
```

### Trends Object:

```javascript
{
  // Trend for each metric
  trends: {
    bloodPressure: {
      direction: "down",           // "up" or "down"
      percentageChange: 5.2,       // Absolute percentage
      recentAverage: 118,          // Last 7 readings avg
      previousAverage: 125,        // Previous 7 readings avg
      dataPoints: 28               // Total readings
    },
    glucose: {
      direction: "up",
      percentageChange: 3.1,
      recentAverage: 98,
      previousAverage: 95,
      dataPoints: 25
    }
    // ... other metrics
  },

  // Overall adherence
  adherenceRate: 95,
  adherenceGrade: "Excellent",   // Excellent, Very Good, Good, Fair, Needs Improvement
  
  // Activity summary
  totalDataPoints: 142,
  activeDays: 28                  // Days with any activity
}
```

---

## 🎯 Quick Summary

```javascript
import { getHealthSummary } from '@/lib/healthDataFetcher';

const summary = await getHealthSummary(userId);

console.log(summary);
```

### Summary Object:

```javascript
{
  adherenceRate: 95,
  adherenceGrade: "Excellent",
  activeMedications: 3,
  totalMetrics: 142,
  
  recentTrends: {
    bloodPressure: { direction: "down", percentageChange: 5.2, ... },
    glucose: { direction: "up", percentageChange: 3.1, ... }
  },
  
  last30Days: {
    dosesTaken: 57,
    missedDoses: 3,
    activeDays: 28
  }
}
```

---

## 💡 Common Use Cases

### 1. Display Adherence Rate
```javascript
const healthData = await getUserHealthData(userId);
const adherenceRate = healthData.adherenceStats.adherenceRate;

return <div>Adherence: {adherenceRate}%</div>;
```

### 2. Show Health Trends
```javascript
const healthData = await getUserHealthData(userId);
const trends = analyzeHealthTrends(healthData);

return (
  <div>
    {Object.entries(trends.trends).map(([metric, data]) => (
      <div key={metric}>
        {metric}: {data.direction === 'up' ? '↑' : '↓'} {data.percentageChange}%
      </div>
    ))}
  </div>
);
```

### 3. Generate AI Context
```javascript
const healthData = await getUserHealthData(userId);
const trends = analyzeHealthTrends(healthData);

const aiContext = `
Adherence: ${healthData.adherenceStats.adherenceRate}% (${trends.adherenceGrade})
Medications: ${healthData.medications.map(m => m.name).join(', ')}
Trends: ${Object.entries(trends.trends).map(([k, v]) => 
  `${k} ${v.direction} ${v.percentageChange}%`
).join(', ')}
`;

// Send to AI for insights
```

### 4. Export Report Data
```javascript
const healthData = await getUserHealthData(userId);

const reportData = {
  period: `${healthData.dateRange.startDate} to ${healthData.dateRange.endDate}`,
  adherence: healthData.adherenceStats.adherenceRate + '%',
  medications: healthData.medications.length,
  metricsLogged: healthData.metrics.length,
  detailedMetrics: healthData.metricsByType
};

// Export as PDF/CSV
```

---

## 🔧 Advanced Features

### Daily Aggregates
Access pre-calculated daily averages:

```javascript
const healthData = await getUserHealthData(userId);
const dailyMetrics = healthData.dailyMetrics;

// Get specific day
const today = new Date().toISOString().split('T')[0];
const todayData = dailyMetrics[today];

console.log('Today BP:', todayData.averages.bp);
console.log('Today Weight:', todayData.averages.weight);
```

### Metrics by Type
Quickly access specific metric type:

```javascript
const healthData = await getUserHealthData(userId);

// Get all blood pressure readings
const bpReadings = healthData.metricsByType.bloodPressure;

// Get latest BP
const latestBP = bpReadings[0]; // Already sorted desc

console.log('Latest BP:', latestBP.value.systolic + '/' + latestBP.value.diastolic);
```

### Calculate Custom Trends
```javascript
const healthData = await getUserHealthData(userId);
const weightReadings = healthData.metricsByType.weight;

// Calculate weight loss
if (weightReadings.length >= 2) {
  const latest = weightReadings[0].value;
  const oldest = weightReadings[weightReadings.length - 1].value;
  const change = latest - oldest;
  
  console.log(`Weight change: ${change > 0 ? '+' : ''}${change} kg`);
}
```

---

## 🎨 Integration Examples

### Dashboard Stats
```javascript
const summary = await getHealthSummary(userId);

return (
  <div className="stats-grid">
    <StatCard 
      title="Adherence" 
      value={summary.adherenceRate + '%'}
      grade={summary.adherenceGrade}
    />
    <StatCard 
      title="Medications" 
      value={summary.activeMedications}
    />
    <StatCard 
      title="Metrics Logged" 
      value={summary.totalMetrics}
    />
  </div>
);
```

### Charts
```javascript
const healthData = await getUserHealthData(userId);
const bpData = healthData.metricsByType.bloodPressure;

const chartData = {
  labels: bpData.map(d => new Date(d.timestamp).toLocaleDateString()),
  datasets: [{
    label: 'Systolic',
    data: bpData.map(d => d.value.systolic)
  }]
};

return <LineChart data={chartData} />;
```

### Notifications
```javascript
const healthData = await getUserHealthData(userId);
const adherenceRate = healthData.adherenceStats.adherenceRate;

if (adherenceRate < 80) {
  showNotification({
    title: 'Adherence Alert',
    message: `Your adherence is ${adherenceRate}%. Try to stay above 80%!`,
    type: 'warning'
  });
}
```

---

## ⚡ Performance Notes

### Optimizations:
- ✅ Single Firestore read per collection (3 total)
- ✅ Client-side aggregation (no server compute)
- ✅ 30-day window (limited data size)
- ✅ Indexed queries for speed

### Caching Recommendation:
```javascript
import { useState, useEffect } from 'react';

function useHealthData(userId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let cache = null;
    let cacheTime = 0;
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    async function load() {
      // Check cache
      if (cache && Date.now() - cacheTime < CACHE_DURATION) {
        setData(cache);
        setLoading(false);
        return;
      }
      
      // Fetch fresh
      const healthData = await getUserHealthData(userId);
      cache = healthData;
      cacheTime = Date.now();
      setData(healthData);
      setLoading(false);
    }
    
    load();
  }, [userId]);
  
  return { data, loading };
}
```

---

## 🐛 Error Handling

```javascript
try {
  const healthData = await getUserHealthData(userId);
  // Use data
} catch (error) {
  if (error.message.includes('userId')) {
    console.error('Invalid user ID');
  } else if (error.message.includes('Failed to fetch')) {
    console.error('Firestore error:', error);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## 📊 Data Requirements

### Firestore Collections:
```
users/{userId}/
  ├── metrics/           ← Health readings
  ├── medications/       ← Active medications  
  └── medicationIntake/  ← Adherence logs
```

### Required Fields:

**Metrics:**
- `type` (string): "weight", "bp", "glucose", "hr", "steps", "sleepHours", "oxygen"
- `value` (number | object): Numeric value or {systolic, diastolic} for BP
- `timestamp` (string): ISO date string

**Medications:**
- `name` (string)
- `dosage` (string)
- `schedule` (array): [{time: "08:00", repeat: "daily"}]
- `startDate` (string): ISO date
- `createdAt` (string): ISO timestamp

**MedicationIntake:**
- `medicationId` (string)
- `medicationName` (string)
- `date` (string): YYYY-MM-DD
- `timestamp` (string): ISO timestamp
- `taken` (boolean)

---

## ✅ Summary

You now have:
- ✅ **Complete data fetcher** (`getUserHealthData`)
- ✅ **Trend analyzer** (`analyzeHealthTrends`)
- ✅ **Quick summary** (`getHealthSummary`)
- ✅ **8 usage examples** (healthDataFetcher.examples.js)
- ✅ **Updated HealthInsights component** (using new utility)
- ✅ **Comprehensive documentation** (this file)

This utility powers the **AI Health Insights** feature and can be reused for:
- 📊 Charts and graphs
- 📄 PDF reports
- 📧 Email summaries
- 🔔 Smart notifications
- 🤖 AI analysis

**Ready for production use!** 🚀
