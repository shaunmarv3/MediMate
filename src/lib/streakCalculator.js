import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Calculate the current medication adherence streak
 * A streak is maintained by taking medications every day
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} - The current streak in days
 */
export async function calculateStreak(userId) {
  try {
    // Create local midnight date (avoid UTC timezone issues)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Get all medications
    const medsSnapshot = await getDocs(
      collection(db, 'users', userId, 'medications')
    );
    
    const medications = medsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (medications.length === 0) {
      return 0;
    }

    // Only check last 30 days for performance
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

    // Get medication intake records from last 30 days only
    const intakeSnapshot = await getDocs(
      query(
        collection(db, 'users', userId, 'medicationIntake'),
        where('date', '>=', startDateStr)
      )
    );

    // Filter to only include intake records for current medications
    const activeMedicationIds = new Set(medications.map(m => m.id));
    const intakeRecords = intakeSnapshot.docs
      .map(doc => doc.data())
      .filter(record => activeMedicationIds.has(record.medicationId));

    console.log('🔥 Streak calculation - Intake records:', {
      total: intakeSnapshot.docs.length,
      forActiveMeds: intakeRecords.length,
      activeMedIds: Array.from(activeMedicationIds)
    });

    // Group intake records by date
    const dateMap = new Map();
    intakeRecords.forEach(record => {
      const date = record.date; // Format: YYYY-MM-DD
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date).push(record);
    });

    console.log('📅 Date map total entries:', dateMap.size);
    dateMap.forEach((records, date) => {
      console.log(`  Date: "${date}" - ${records.length} records - MedIds:`, records.map(r => r.medicationId));
    });

    let streak = 0;
    let checkDate = new Date(today);
    const MAX_DAYS_TO_CHECK = 30; // Only check last 30 days

    // Count backwards from today
    for (let i = 0; i < MAX_DAYS_TO_CHECK; i++) {
      const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      
      // Get active medications for this date
      const activeMeds = medications.filter(med => {
        // Parse startDate as local date
        const startDateParts = (med.startDate || med.createdAt).split('-').map(Number);
        const startDate = new Date(startDateParts[0], startDateParts[1] - 1, startDateParts[2], 0, 0, 0, 0);
        
        let endDate;
        if (med.endDate) {
          const endDateParts = med.endDate.split('-').map(Number);
          endDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2], 23, 59, 59, 999);
        } else {
          endDate = new Date(2099, 11, 31, 23, 59, 59, 999);
        }
        
        return checkDate >= startDate && checkDate <= endDate;
      });

      // If no active medications on this date, move to previous day
      if (activeMeds.length === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      // Check if user took medications on this date
      const intakesForDate = dateMap.get(dateStr) || [];
      const takenMedIds = new Set(intakesForDate.map(i => i.medicationId));
      
      console.log(`📅 ${dateStr} - Checking streak:`, {
        activeMeds: activeMeds.map(m => m.name),
        activeMedIds: activeMeds.map(m => m.id),
        intakesCount: intakesForDate.length,
        takenMedIds: Array.from(takenMedIds),
        allTaken: activeMeds.every(med => takenMedIds.has(med.id))
      });
      
      // Check if all active medications were taken
      const allTaken = activeMeds.every(med => takenMedIds.has(med.id));

      if (allTaken) {
        streak++;
        console.log(`✅ Day ${dateStr}: All meds taken! Streak = ${streak}`);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Streak is broken
        console.log(`❌ Day ${dateStr}: Streak broken! Missing meds.`);
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Get adherence stats for the last 30 days
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - Stats including rate, taken, expected
 */
export async function get30DayAdherence(userId) {
  try {
    // Create local midnight dates (avoid UTC timezone issues)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const thirtyDaysStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

    console.log('📊 Calculating 30-day adherence...');
    console.log('Period:', thirtyDaysStr, 'to', todayStr);

    // Get all medications
    const medsSnapshot = await getDocs(
      collection(db, 'users', userId, 'medications')
    );
    const allMedications = medsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter to only include currently active medications (not ended)
    const medications = allMedications.filter(med => {
      if (med.endDate) {
        // Parse endDate as local date
        const dateParts = med.endDate.split('-').map(Number);
        const endDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 23, 59, 59, 999);
        const isActive = endDate >= thirtyDaysAgo;
        if (!isActive) {
          console.log(`⏭️ Skipping ended medication: ${med.name} (ended: ${med.endDate})`);
        }
        return isActive;
      }
      return true; // No end date means still active
    });

    console.log('Total medications:', medications.length);
    console.log('Active medications:', medications.map(m => m.name).join(', '));

    // Calculate expected doses in the last 30 days
    let totalExpected = 0;
    for (const med of medications) {
      // Parse date as local date, not UTC
      let medStartDate;
      if (med.startDate) {
        const [year, month, day] = med.startDate.split('-').map(Number);
        console.log(`Parsing ${med.name}: year=${year}, month=${month}, day=${day}`);
        medStartDate = new Date(year, month - 1, day, 0, 0, 0, 0); // Month is 0-indexed
        console.log(`Created date object:`, `${medStartDate.getFullYear()}-${String(medStartDate.getMonth() + 1).padStart(2, '0')}-${String(medStartDate.getDate()).padStart(2, '0')}`);
      } else {
        medStartDate = new Date(med.createdAt);
      }
      medStartDate.setHours(0, 0, 0, 0);

      console.log(`${med.name} - startDate: ${med.startDate}, createdAt: ${med.createdAt}`);
      console.log(`${med.name} - medStartDate (local): ${medStartDate.getFullYear()}-${String(medStartDate.getMonth() + 1).padStart(2, '0')}-${String(medStartDate.getDate()).padStart(2, '0')}`);

      let medEndDate;
      if (med.endDate) {
        const endDateParts = med.endDate.split('-').map(Number);
        medEndDate = new Date(endDateParts[0], endDateParts[1] - 1, endDateParts[2], 23, 59, 59, 999);
      } else {
        medEndDate = today;
      }

      const effectiveStartDate = medStartDate > thirtyDaysAgo ? medStartDate : thirtyDaysAgo;
      const effectiveEndDate = medEndDate > today ? today : medEndDate;

      if (effectiveStartDate <= effectiveEndDate) {
        // Calculate the number of calendar days (inclusive)
        // If both dates are the same day, it should be 1 day
        const startDay = new Date(effectiveStartDate.getFullYear(), effectiveStartDate.getMonth(), effectiveStartDate.getDate());
        const endDay = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate());
        const daysActive = Math.round((endDay - startDay) / (1000 * 60 * 60 * 24)) + 1;
        
        // Get number of doses per day from schedule
        const dosesPerDay = med.schedule ? med.schedule.length : 1;
        const expectedDoses = daysActive * dosesPerDay;
        
        totalExpected += expectedDoses;
        const startStr = `${effectiveStartDate.getFullYear()}-${String(effectiveStartDate.getMonth() + 1).padStart(2, '0')}-${String(effectiveStartDate.getDate()).padStart(2, '0')}`;
        const endStr = `${effectiveEndDate.getFullYear()}-${String(effectiveEndDate.getMonth() + 1).padStart(2, '0')}-${String(effectiveEndDate.getDate()).padStart(2, '0')}`;
        console.log(`${med.name}: ${daysActive} day(s) × ${dosesPerDay} dose(s)/day = ${expectedDoses} expected doses (${startStr} to ${endStr})`);
      }
    }

    console.log('Total expected doses:', totalExpected);

    // Get intake records from the last 30 days (already have local date strings)
    const startDateStr = thirtyDaysStr;
    const endDateStr = todayStr;

    const intakeSnapshot = await getDocs(
      collection(db, 'users', userId, 'medicationIntake')
    );

    // Only count intake records for medications that still exist
    const activeMedicationIds = new Set(medications.map(m => m.id));
    
    const intakeRecords = intakeSnapshot.docs
      .map(doc => doc.data())
      .filter(record => {
        // Filter by date range
        const inDateRange = record.date >= startDateStr && record.date <= endDateStr;
        // Filter by active medications only
        const isActiveMedication = activeMedicationIds.has(record.medicationId);
        
        if (inDateRange && !isActiveMedication) {
          console.log(`⏭️ Skipping intake record for deleted/old medication (ID: ${record.medicationId})`);
        }
        
        return inDateRange && isActiveMedication;
      });

    const totalTaken = intakeRecords.length;

    console.log('Total taken doses:', totalTaken);
    console.log('Adherence calculation:', totalTaken, '/', totalExpected, '=', totalTaken / totalExpected);

    const adherenceRate = totalExpected > 0 
      ? Math.min(Math.round((totalTaken / totalExpected) * 100), 100)
      : 0;

    console.log('Final adherence rate:', adherenceRate + '%');

    return {
      adherenceRate,
      totalTaken,
      totalExpected,
      missedDoses: Math.max(totalExpected - totalTaken, 0)
    };
  } catch (error) {
    console.error('Error calculating 30-day adherence:', error);
    return {
      adherenceRate: 0,
      totalTaken: 0,
      totalExpected: 0,
      missedDoses: 0
    };
  }
}
