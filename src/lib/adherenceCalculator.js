import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Calculate adherence rate from user account creation to today
 * Formula: (Total medications taken / Total expected medications) × 100
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} - The adherence rate as a percentage
 */
export async function calculateAndStoreAdherence(userId) {
  try {
    // Get user's account creation date
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error('User document not found');
      return 0;
    }

    const userData = userDoc.data();
    const accountCreatedAt = new Date(userData.createdAt);
    accountCreatedAt.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate total days since account creation
    const daysSinceCreation = Math.ceil((today - accountCreatedAt) / (1000 * 60 * 60 * 24)) + 1;

    // Get all medications (including past ones if they have endDate)
    const medsQuery = query(collection(db, 'users', userId, 'medications'));
    const medsSnapshot = await getDocs(medsQuery);
    const medications = medsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate expected medications per day
    let totalExpectedLogs = 0;

    for (const med of medications) {
      const medStartDate = new Date(med.startDate || med.createdAt);
      medStartDate.setHours(0, 0, 0, 0);

      const medEndDate = med.endDate ? new Date(med.endDate) : today;
      medEndDate.setHours(23, 59, 59, 999);

      // Calculate days this medication was active
      const effectiveStartDate = medStartDate > accountCreatedAt ? medStartDate : accountCreatedAt;
      const effectiveEndDate = medEndDate > today ? today : medEndDate;

      if (effectiveStartDate <= effectiveEndDate) {
        const daysActive = Math.ceil((effectiveEndDate - effectiveStartDate) / (1000 * 60 * 60 * 24)) + 1;
        totalExpectedLogs += daysActive;
      }
    }

    // Get all medication intake logs
    const intakeQuery = query(collection(db, 'users', userId, 'medicationIntake'));
    const intakeSnapshot = await getDocs(intakeQuery);
    const totalActualLogs = intakeSnapshot.docs.length;

    // Calculate adherence rate
    let adherenceRate = 0;
    if (totalExpectedLogs > 0) {
      adherenceRate = Math.round((totalActualLogs / totalExpectedLogs) * 100);
      // Cap at 100%
      adherenceRate = Math.min(adherenceRate, 100);
    }

    // Store today's adherence stats
    const todayStr = today.toISOString().split('T')[0];
    await setDoc(doc(db, 'users', userId, 'adherenceStats', todayStr), {
      date: todayStr,
      adherenceRate,
      totalExpectedLogs,
      totalActualLogs,
      daysSinceCreation,
      calculatedAt: new Date().toISOString(),
    });

    return adherenceRate;
  } catch (error) {
    console.error('Error calculating adherence:', error);
    return 0;
  }
}

/**
 * Get the latest adherence rate from database
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<number>} - The adherence rate as a percentage
 */
export async function getLatestAdherence(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const adherenceDoc = await getDoc(doc(db, 'users', userId, 'adherenceStats', todayStr));
    
    if (adherenceDoc.exists()) {
      return adherenceDoc.data().adherenceRate;
    }

    // If today's adherence not calculated yet, calculate it now
    return await calculateAndStoreAdherence(userId);
  } catch (error) {
    console.error('Error getting adherence:', error);
    return 0;
  }
}
