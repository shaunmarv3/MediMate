import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Comprehensive Notification Manager
 * Handles all critical health events and medication reminders
 */

// Show browser notification
function showNotification(title, body, options = {}) {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return;
  }

  console.log('Notification permission status:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log(`Creating notification: ${title} - ${body}`);
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      requireInteraction: options.requireInteraction || false,
      vibrate: [200, 100, 200],
      tag: options.tag || 'medimate-notification',
      ...options
    });
  } else if (Notification.permission === 'default') {
    console.log('Requesting notification permission...');
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permission granted! Showing notification...');
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          requireInteraction: options.requireInteraction || false,
          vibrate: [200, 100, 200],
          tag: options.tag || 'medimate-notification',
          ...options
        });
      } else {
        console.log('Notification permission denied');
      }
    });
  } else {
    console.log('Notification permission was previously denied');
  }
}

/**
 * Check for expiring medications (within 7 days)
 */
export async function checkExpiringMedications(userId, onNotification) {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
    
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Format dates as local strings for logging (avoid UTC conversion)
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const sevenDaysStr = `${sevenDaysFromNow.getFullYear()}-${String(sevenDaysFromNow.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysFromNow.getDate()).padStart(2, '0')}`;

    console.log('Checking expiring medications...');
    console.log('Today:', nowStr);
    console.log('7 days from now:', sevenDaysStr);

    const medsSnapshot = await getDocs(
      collection(db, 'users', userId, 'medications')
    );

    console.log('Total medications found:', medsSnapshot.docs.length);

    const expiringMeds = [];

    medsSnapshot.docs.forEach(doc => {
      const med = doc.data();
      
      console.log(`Checking ${med.name}, expirationDate:`, med.expirationDate);
      
      if (med.expirationDate) {
        // Parse the expiry date as local date (avoid UTC timezone issues)
        let expiryDate;
        if (typeof med.expirationDate === 'string') {
          // Parse as local date instead of UTC
          const [year, month, day] = med.expirationDate.split('T')[0].split('-').map(Number);
          expiryDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        } else {
          expiryDate = med.expirationDate.toDate ? med.expirationDate.toDate() : new Date(med.expirationDate);
          expiryDate.setHours(0, 0, 0, 0);
        }
        
        // Format as local date for logging
        const expiryStr = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}`;
        
        console.log(`${med.name} expires on:`, expiryStr);
        
        // Check if expiring within 7 days
        if (expiryDate >= now && expiryDate <= sevenDaysFromNow) {
          const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          console.log(`✅ ${med.name} is expiring in ${daysUntilExpiry} days!`);
          
          expiringMeds.push({
            id: doc.id,
            name: med.name,
            expirationDate: med.expirationDate,
            daysUntilExpiry
          });

          // Show notification
          const message = daysUntilExpiry === 0 
            ? `${med.name} expires today!`
            : daysUntilExpiry === 1
            ? `${med.name} expires tomorrow!`
            : `${med.name} expires in ${daysUntilExpiry} days`;

          console.log('Showing notification:', message);

          showNotification('⚠️ Medication Expiring Soon', message, {
            requireInteraction: true,
            tag: `expiring-${doc.id}`
          });

          if (onNotification) {
            console.log('Calling onNotification callback');
            onNotification({
              type: 'expiring',
              severity: daysUntilExpiry <= 1 ? 'critical' : 'warning',
              title: 'Medication Expiring',
              message,
              data: { medicationId: doc.id, medicationName: med.name, daysUntilExpiry }
            });
          }
        } else {
          const expiryStr = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}`;
          console.log(`⏭️ ${med.name} not in expiring range (expires: ${expiryStr})`);
        }
      }
    });

    console.log('Total expiring medications:', expiringMeds.length);
    return expiringMeds;
  } catch (error) {
    console.error('Error checking expiring medications:', error);
    return [];
  }
}

/**
 * Check for low stock medications (< 7 days supply)
 */
export async function checkLowStock(userId, onNotification) {
  try {
    const medsSnapshot = await getDocs(
      collection(db, 'users', userId, 'medications')
    );

    const lowStockMeds = [];

    medsSnapshot.docs.forEach(doc => {
      const med = doc.data();
      
      if (med.stockQuantity !== undefined && med.dailyDosage) {
        const daysRemaining = Math.floor(med.stockQuantity / med.dailyDosage);
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
          lowStockMeds.push({
            id: doc.id,
            name: med.name,
            stockQuantity: med.stockQuantity,
            daysRemaining
          });

          const message = `Only ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} of ${med.name} remaining`;

          showNotification('📦 Low Medication Stock', message, {
            requireInteraction: daysRemaining <= 2,
            tag: `low-stock-${doc.id}`
          });

          if (onNotification) {
            onNotification({
              type: 'low-stock',
              severity: daysRemaining <= 2 ? 'critical' : 'warning',
              title: 'Low Stock Alert',
              message,
              data: { medicationId: doc.id, medicationName: med.name, daysRemaining }
            });
          }
        } else if (daysRemaining === 0) {
          const message = `${med.name} is out of stock!`;

          showNotification('🚨 Medication Out of Stock', message, {
            requireInteraction: true,
            tag: `out-of-stock-${doc.id}`
          });

          if (onNotification) {
            onNotification({
              type: 'out-of-stock',
              severity: 'critical',
              title: 'Out of Stock',
              message,
              data: { medicationId: doc.id, medicationName: med.name }
            });
          }
        }
      }
    });

    return lowStockMeds;
  } catch (error) {
    console.error('Error checking low stock:', error);
    return [];
  }
}

/**
 * Check for missed medications (today)
 */
export async function checkMissedMedications(userId, onNotification) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];

    // Get all medications
    const medsSnapshot = await getDocs(
      collection(db, 'users', userId, 'medications')
    );

    // Get today's intake records
    const intakeQuery = query(
      collection(db, 'users', userId, 'medicationIntake'),
      where('date', '==', todayStr)
    );
    const intakeSnapshot = await getDocs(intakeQuery);
    const takenMedIds = new Set(intakeSnapshot.docs.map(doc => doc.data().medicationId));

    const missedMeds = [];

    medsSnapshot.docs.forEach(doc => {
      const med = doc.data();
      
      // Check if medication is active
      const startDate = new Date(med.startDate || med.createdAt);
      startDate.setHours(0, 0, 0, 0);
      const endDate = med.endDate ? new Date(med.endDate) : new Date('2099-12-31');
      
      if (today >= startDate && today <= endDate && !takenMedIds.has(doc.id)) {
        missedMeds.push({
          id: doc.id,
          name: med.name,
          dosage: med.dosage
        });

        const message = `You haven't taken ${med.name} (${med.dosage}) today`;

        showNotification('💊 Missed Medication', message, {
          requireInteraction: true,
          tag: `missed-${doc.id}`
        });

        if (onNotification) {
          onNotification({
            type: 'missed',
            severity: 'warning',
            title: 'Missed Medication',
            message,
            data: { medicationId: doc.id, medicationName: med.name }
          });
        }
      }
    });

    return missedMeds;
  } catch (error) {
    console.error('Error checking missed medications:', error);
    return [];
  }
}

/**
 * Check for critical health metrics
 */
export async function checkCriticalMetrics(userId, onNotification) {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const metricsQuery = query(
      collection(db, 'users', userId, 'metrics'),
      where('timestamp', '>=', threeDaysAgo.toISOString())
    );

    const metricsSnapshot = await getDocs(metricsQuery);
    const criticalMetrics = [];

    metricsSnapshot.docs.forEach(doc => {
      const metric = doc.data();
      let isCritical = false;
      let message = '';

      switch (metric.type) {
        case 'bloodPressure':
          const systolic = metric.value?.systolic;
          const diastolic = metric.value?.diastolic;
          
          if (systolic >= 180 || diastolic >= 120) {
            isCritical = true;
            message = `🚨 Critical Blood Pressure: ${systolic}/${diastolic} mmHg - Seek immediate medical attention!`;
          } else if (systolic >= 140 || diastolic >= 90) {
            isCritical = true;
            message = `⚠️ High Blood Pressure: ${systolic}/${diastolic} mmHg - Consider consulting your doctor`;
          } else if (systolic < 90 || diastolic < 60) {
            isCritical = true;
            message = `⚠️ Low Blood Pressure: ${systolic}/${diastolic} mmHg - Monitor closely`;
          }
          break;

        case 'glucose':
          const glucose = metric.value;
          
          if (glucose >= 300) {
            isCritical = true;
            message = `🚨 Critical High Glucose: ${glucose} mg/dL - Seek immediate medical attention!`;
          } else if (glucose >= 180) {
            isCritical = true;
            message = `⚠️ High Glucose: ${glucose} mg/dL - Consider consulting your doctor`;
          } else if (glucose < 70) {
            isCritical = true;
            message = `🚨 Low Glucose: ${glucose} mg/dL - Treat hypoglycemia immediately!`;
          }
          break;

        case 'heartRate':
          const hr = metric.value;
          
          if (hr >= 120) {
            isCritical = true;
            message = `⚠️ High Heart Rate: ${hr} bpm - Monitor closely`;
          } else if (hr < 50) {
            isCritical = true;
            message = `⚠️ Low Heart Rate: ${hr} bpm - Monitor closely`;
          }
          break;

        case 'oxygen':
          const oxygen = metric.value;
          
          if (oxygen < 90) {
            isCritical = true;
            message = `🚨 Low Oxygen Saturation: ${oxygen}% - Seek immediate medical attention!`;
          } else if (oxygen < 95) {
            isCritical = true;
            message = `⚠️ Low Oxygen: ${oxygen}% - Monitor closely`;
          }
          break;
      }

      if (isCritical) {
        criticalMetrics.push({
          id: doc.id,
          type: metric.type,
          value: metric.value,
          timestamp: metric.timestamp,
          message
        });

        showNotification('🏥 Critical Health Alert', message, {
          requireInteraction: true,
          tag: `critical-metric-${doc.id}`
        });

        if (onNotification) {
          onNotification({
            type: 'critical-metric',
            severity: 'critical',
            title: 'Health Alert',
            message,
            data: { metricType: metric.type, value: metric.value }
          });
        }
      }
    });

    return criticalMetrics;
  } catch (error) {
    console.error('Error checking critical metrics:', error);
    return [];
  }
}

/**
 * Check for low adherence rate
 */
export async function checkAdherence(userId, adherenceRate, onNotification) {
  if (adherenceRate < 80 && adherenceRate > 0) {
    const message = `Your adherence rate is ${adherenceRate}% - Try to stay above 80% for best results`;

    showNotification('📊 Adherence Alert', message, {
      tag: 'low-adherence'
    });

    if (onNotification) {
      onNotification({
        type: 'low-adherence',
        severity: adherenceRate < 60 ? 'critical' : 'warning',
        title: 'Low Adherence',
        message,
        data: { adherenceRate }
      });
    }
  }
}

/**
 * Setup comprehensive notification monitoring
 */
export function setupNotificationMonitoring(userId, onNotification) {
  // Check immediately on setup
  checkExpiringMedications(userId, onNotification);
  checkLowStock(userId, onNotification);
  checkCriticalMetrics(userId, onNotification);

  // Check missed medications at end of day (8 PM)
  const now = new Date();
  const eightPM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0);
  
  if (now < eightPM) {
    const timeUntilEightPM = eightPM.getTime() - now.getTime();
    setTimeout(() => {
      checkMissedMedications(userId, onNotification);
    }, timeUntilEightPM);
  }

  // Setup periodic checks (every hour)
  const intervalId = setInterval(() => {
    checkExpiringMedications(userId, onNotification);
    checkLowStock(userId, onNotification);
    checkCriticalMetrics(userId, onNotification);
  }, 60 * 60 * 1000); // Every hour

  return () => clearInterval(intervalId);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
