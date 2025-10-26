import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Fetches comprehensive user health data from the last 30 days
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<Object>} Combined health data object
 */
export async function getUserHealthData(userId) {
  if (!userId) {
    throw new Error('userId is required');
  }

  try {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    // Fetch health metrics from last 30 days
    const metricsRef = collection(db, 'users', userId, 'metrics');
    const metricsQuery = query(
      metricsRef,
      where('timestamp', '>=', thirtyDaysAgoISO),
      orderBy('timestamp', 'desc')
    );
    const metricsSnapshot = await getDocs(metricsQuery);
    const metrics = metricsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch all active medications (filter out expired/ended ones)
    const medicationsRef = collection(db, 'users', userId, 'medications');
    const medicationsQuery = query(medicationsRef, orderBy('createdAt', 'desc'));
    const medicationsSnapshot = await getDocs(medicationsQuery);
    const allMedications = medicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter out ended medications
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    const medications = allMedications.filter(med => {
      if (med.endDate) {
        const dateParts = med.endDate.split('-').map(Number);
        const endDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 23, 59, 59, 999);
        return endDate >= today; // Only include if not yet ended
      }
      return true; // No end date means still active
    });

    console.log('📋 Medications fetched:', {
      total: allMedications.length,
      active: medications.length,
      filtered: allMedications.length - medications.length,
      activeNames: medications.map(m => m.name).join(', ')
    });

    // Fetch medication intake logs from last 30 days
    const intakeRef = collection(db, 'users', userId, 'medicationIntake');
    const intakeQuery = query(
      intakeRef,
      where('timestamp', '>=', thirtyDaysAgoISO),
      orderBy('timestamp', 'desc')
    );
    const intakeSnapshot = await getDocs(intakeQuery);
    
    // Filter intake logs to only include active medications
    const activeMedicationIds = new Set(medications.map(m => m.id));
    const adherenceLogs = intakeSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(log => activeMedicationIds.has(log.medicationId));

    console.log('💊 Intake logs:', {
      total: intakeSnapshot.docs.length,
      forActiveMeds: adherenceLogs.length,
      filtered: intakeSnapshot.docs.length - adherenceLogs.length
    });

    // Calculate adherence statistics
    const adherenceStats = calculateAdherenceStats(medications, adherenceLogs, thirtyDaysAgo);

    // Organize metrics by type for easier analysis
    const metricsByType = organizeMetricsByType(metrics);

    // Calculate daily aggregates
    const dailyMetrics = aggregateDailyMetrics(metrics);

    return {
      metrics,
      metricsByType,
      dailyMetrics,
      medications,
      adherenceLogs,
      adherenceStats,
      dateRange: {
        startDate: thirtyDaysAgoISO,
        endDate: new Date().toISOString(),
        days: 30
      }
    };
  } catch (error) {
    console.error('Error fetching user health data:', error);
    throw new Error(`Failed to fetch health data: ${error.message}`);
  }
}

/**
 * Calculate adherence statistics from medications and intake logs
 * @private
 */
function calculateAdherenceStats(medications, adherenceLogs, thirtyDaysAgo) {
  // Calculate total expected doses in the last 30 days
  let totalExpectedDoses = 0;
  
  medications.forEach(med => {
    if (!med.schedule || !Array.isArray(med.schedule)) return;
    
    // Parse dates as local dates (avoid UTC timezone issues)
    let medStartDate;
    if (med.startDate) {
      const [year, month, day] = med.startDate.split('-').map(Number);
      medStartDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      medStartDate = new Date(med.createdAt);
    }
    
    let medEndDate;
    if (med.endDate) {
      const endDateParts = med.endDate.split('-').map(Number);
      medEndDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2], 23, 59, 59, 999);
    } else {
      const now = new Date();
      medEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }
    
    const effectiveStartDate = medStartDate > thirtyDaysAgo ? medStartDate : thirtyDaysAgo;
    const effectiveEndDate = medEndDate < new Date() ? medEndDate : new Date();
    
    if (effectiveStartDate <= effectiveEndDate) {
      // Calculate the number of calendar days (inclusive)
      const startDay = new Date(effectiveStartDate.getFullYear(), effectiveStartDate.getMonth(), effectiveStartDate.getDate());
      const endDay = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate());
      const daysActive = Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
      
      const dosesPerDay = med.schedule.length;
      totalExpectedDoses += daysActive * dosesPerDay;
    }
  });

  // Count doses taken
  const dosesTaken = adherenceLogs.filter(log => log.taken === true).length;
  
  // Calculate missed doses
  const missedDoses = Math.max(0, totalExpectedDoses - dosesTaken);
  
  // Calculate adherence rate (cap at 100%)
  const adherenceRate = totalExpectedDoses > 0 
    ? Math.min(Math.round((dosesTaken / totalExpectedDoses) * 100), 100)
    : 0;

  return {
    totalExpectedDoses,
    dosesTaken,
    missedDoses,
    adherenceRate,
    logsCount: adherenceLogs.length
  };
}

/**
 * Organize metrics by type for easier analysis
 * @private
 */
function organizeMetricsByType(metrics) {
  const organized = {
    bloodPressure: [],
    glucose: [],
    weight: [],
    heartRate: [],
    steps: [],
    sleepHours: [],
    oxygen: []
  };

  const typeMapping = {
    bp: 'bloodPressure',
    glucose: 'glucose',
    bloodSugar: 'glucose',
    weight: 'weight',
    hr: 'heartRate',
    heartRate: 'heartRate',
    steps: 'steps',
    sleepHours: 'sleepHours',
    sleep: 'sleepHours',
    oxygen: 'oxygen',
    spo2: 'oxygen'
  };

  metrics.forEach(metric => {
    const category = typeMapping[metric.type];
    if (category && organized[category]) {
      organized[category].push({
        value: metric.value,
        timestamp: metric.timestamp,
        note: metric.note
      });
    }
  });

  return organized;
}

/**
 * Aggregate metrics by day for trend analysis
 * @private
 */
function aggregateDailyMetrics(metrics) {
  const dailyData = {};

  metrics.forEach(metric => {
    const date = metric.timestamp.split('T')[0]; // Get YYYY-MM-DD
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        metrics: {}
      };
    }

    const metricType = metric.type;
    if (!dailyData[date].metrics[metricType]) {
      dailyData[date].metrics[metricType] = [];
    }

    dailyData[date].metrics[metricType].push(metric.value);
  });

  // Calculate averages for each day
  Object.keys(dailyData).forEach(date => {
    const dayData = dailyData[date];
    const averages = {};

    Object.keys(dayData.metrics).forEach(type => {
      const values = dayData.metrics[type];
      
      if (type === 'bp') {
        // Special handling for blood pressure
        const systolicValues = values.map(v => v.systolic || 0);
        const diastolicValues = values.map(v => v.diastolic || 0);
        averages[type] = {
          systolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
          diastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
          count: values.length
        };
      } else {
        // Average for other metrics
        const numericValues = values.filter(v => typeof v === 'number');
        if (numericValues.length > 0) {
          averages[type] = {
            average: Math.round((numericValues.reduce((a, b) => a + b, 0) / numericValues.length) * 10) / 10,
            count: numericValues.length,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues)
          };
        }
      }
    });

    dayData.averages = averages;
  });

  return dailyData;
}

/**
 * Get health trends and insights from the data
 * @param {Object} healthData - Result from getUserHealthData
 * @returns {Object} Trend analysis
 */
export function analyzeHealthTrends(healthData) {
  const { metricsByType, adherenceStats, dailyMetrics } = healthData;
  const trends = {};

  // Analyze each metric type
  Object.keys(metricsByType).forEach(type => {
    const data = metricsByType[type];
    if (data.length < 2) return;

    const recent = data.slice(0, Math.min(7, data.length)); // Last 7 entries
    const older = data.slice(7, Math.min(14, data.length)); // Previous 7 entries

    if (older.length === 0) return;

    const recentAvg = calculateAverage(recent.map(d => d.value));
    const olderAvg = calculateAverage(older.map(d => d.value));

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    trends[type] = {
      direction: change > 0 ? 'up' : 'down',
      percentageChange: Math.abs(Math.round(change * 10) / 10),
      recentAverage: Math.round(recentAvg * 10) / 10,
      previousAverage: Math.round(olderAvg * 10) / 10,
      dataPoints: data.length
    };
  });

  return {
    trends,
    adherenceRate: adherenceStats.adherenceRate,
    adherenceGrade: getAdherenceGrade(adherenceStats.adherenceRate),
    totalDataPoints: healthData.metrics.length,
    activeDays: Object.keys(dailyMetrics).length
  };
}

/**
 * Calculate average, handling blood pressure objects
 * @private
 */
function calculateAverage(values) {
  if (values.length === 0) return 0;

  const numericValues = values.map(v => {
    if (typeof v === 'object' && v.systolic) {
      return v.systolic; // Use systolic for BP
    }
    return typeof v === 'number' ? v : 0;
  });

  return numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
}

/**
 * Get adherence grade based on percentage
 * @private
 */
function getAdherenceGrade(rate) {
  if (rate >= 95) return 'Excellent';
  if (rate >= 85) return 'Very Good';
  if (rate >= 75) return 'Good';
  if (rate >= 60) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Get quick health summary
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<Object>} Quick health summary
 */
export async function getHealthSummary(userId) {
  const healthData = await getUserHealthData(userId);
  const trends = analyzeHealthTrends(healthData);

  return {
    adherenceRate: healthData.adherenceStats.adherenceRate,
    adherenceGrade: trends.adherenceGrade,
    activeMedications: healthData.medications.length,
    totalMetrics: healthData.metrics.length,
    recentTrends: trends.trends,
    last30Days: {
      dosesTaken: healthData.adherenceStats.dosesTaken,
      missedDoses: healthData.adherenceStats.missedDoses,
      activeDays: trends.activeDays
    }
  };
}
