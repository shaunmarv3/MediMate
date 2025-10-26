/**
 * AI Insights History Manager
 * 
 * Manages weekly snapshots of AI health insights for historical tracking
 * Stores in Firestore: aiInsightsHistory/{userId}/snapshots/{weekId}
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  getDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Save current insights as a weekly snapshot
 * 
 * @param {string} userId - Firebase user ID
 * @param {Array} insights - Current insights array
 * @returns {Promise<string>} Snapshot ID
 */
export async function saveInsightsSnapshot(userId, insights) {
  try {
    // Generate week ID (e.g., "2025-W43")
    const weekId = getWeekId(new Date());
    
    // Reference to snapshot document
    const snapshotRef = doc(db, 'aiInsightsHistory', userId, 'snapshots', weekId);
    
    // Extract key phrases from insights
    const keyPhrases = insights.map(insight => ({
      type: insight.type,
      category: insight.category,
      snippet: insight.message.substring(0, 100), // First 100 chars
      priority: insight.priority
    }));
    
    // Count insights by type
    const typeCounts = insights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {});
    
    // Save snapshot
    await setDoc(snapshotRef, {
      weekId,
      userId,
      insights: keyPhrases,
      fullInsights: insights, // Store full insights for detail view
      timestamp: serverTimestamp(),
      insightsCount: insights.length,
      typeCounts,
      generatedAt: new Date().toISOString(),
      week: getWeekNumber(new Date()),
      year: new Date().getFullYear()
    });
    
    console.log('📸 Saved insights snapshot:', weekId);
    
    return weekId;
    
  } catch (error) {
    console.error('Error saving insights snapshot:', error);
    throw error;
  }
}

/**
 * Get insights history (last N weeks)
 * 
 * @param {string} userId - Firebase user ID
 * @param {number} limitCount - Number of weeks to retrieve (default: 12)
 * @returns {Promise<Array>} Array of historical snapshots
 */
export async function getInsightsHistory(userId, limitCount = 12) {
  try {
    const snapshotsRef = collection(db, 'aiInsightsHistory', userId, 'snapshots');
    
    const q = query(
      snapshotsRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));
    
    console.log('📜 Retrieved', history.length, 'historical snapshots');
    
    return history;
    
  } catch (error) {
    console.error('Error getting insights history:', error);
    return [];
  }
}

/**
 * Get a specific historical snapshot
 * 
 * @param {string} userId - Firebase user ID
 * @param {string} weekId - Week ID (e.g., "2025-W43")
 * @returns {Promise<Object|null>} Snapshot data
 */
export async function getSnapshot(userId, weekId) {
  try {
    const snapshotRef = doc(db, 'aiInsightsHistory', userId, 'snapshots', weekId);
    const docSnap = await getDoc(snapshotRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toDate()
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting snapshot:', error);
    return null;
  }
}

/**
 * Get week ID in format YYYY-Www
 * 
 * @param {Date} date - Date object
 * @returns {string} Week ID (e.g., "2025-W43")
 */
function getWeekId(date) {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Get ISO week number
 * 
 * @param {Date} date - Date object
 * @returns {number} Week number (1-53)
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Format week ID to human-readable string
 * 
 * @param {string} weekId - Week ID (e.g., "2025-W43")
 * @returns {string} Formatted string (e.g., "Week 43, 2025")
 */
export function formatWeekId(weekId) {
  const [year, week] = weekId.split('-W');
  return `Week ${week}, ${year}`;
}

/**
 * Get date range for a week
 * 
 * @param {string} weekId - Week ID (e.g., "2025-W43")
 * @returns {Object} { start: Date, end: Date }
 */
export function getWeekDateRange(weekId) {
  const [year, week] = weekId.split('-W').map(Number);
  
  // Get first day of year
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    start: weekStart,
    end: weekEnd
  };
}

/**
 * Check if a snapshot should be created for current week
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} True if snapshot should be created
 */
export async function shouldCreateSnapshot(userId) {
  try {
    const currentWeekId = getWeekId(new Date());
    const snapshot = await getSnapshot(userId, currentWeekId);
    
    // Create snapshot if it doesn't exist for this week
    return snapshot === null;
    
  } catch (error) {
    console.error('Error checking snapshot:', error);
    return false;
  }
}
