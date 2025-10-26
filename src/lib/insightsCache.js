/**
 * AI Insights Cache Manager
 * 
 * Manages Firestore caching for AI-generated health insights
 * to reduce API calls and improve load times.
 * 
 * Cache Strategy:
 * - Store insights in Firestore: aiInsights/{userId}
 * - Cache duration: 7 days
 * - Auto-refresh if cache is stale
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserHealthData } from '@/lib/healthDataFetcher';
import { generateHealthInsights } from '@/lib/healthInsightsGenerator';
import { saveInsightsSnapshot, shouldCreateSnapshot } from '@/lib/insightsHistory';

/**
 * Cache configuration
 */
const CACHE_DURATION_DAYS = 7;
const CACHE_DURATION_MS = CACHE_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Get cached insights or generate new ones
 * 
 * @param {string} userId - Firebase user ID
 * @param {boolean} forceRefresh - Force regeneration even if cache is valid
 * @returns {Promise<Array>} Array of insight objects
 */
export async function getCachedInsights(userId, forceRefresh = false) {
  try {
    // Reference to cache document
    const cacheRef = doc(db, 'aiInsights', userId);
    
    // Try to get cached insights
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists() && !forceRefresh) {
      const cachedData = cacheDoc.data();
      const lastGenerated = cachedData.timestamp?.toDate();
      const now = new Date();
      
      // Check if cache is still valid (less than 7 days old)
      if (lastGenerated) {
        const cacheAge = now - lastGenerated;
        
        if (cacheAge < CACHE_DURATION_MS) {
          console.log('✅ Loading insights from cache (age: ' + Math.round(cacheAge / (1000 * 60 * 60 * 24)) + ' days)');
          return cachedData.insights || [];
        } else {
          console.log('⏰ Cache expired (age: ' + Math.round(cacheAge / (1000 * 60 * 60 * 24)) + ' days), regenerating...');
        }
      }
    } else if (forceRefresh) {
      console.log('🔄 Force refresh requested, regenerating insights...');
    } else {
      console.log('📭 No cached insights found, generating new...');
    }
    
    // Cache is stale or doesn't exist - generate new insights
    const newInsights = await generateFreshInsights(userId);
    
    // Save to cache
    await saveToCache(userId, newInsights);
    
    return newInsights;
    
  } catch (error) {
    console.error('Error in getCachedInsights:', error);
    
    // Return fallback insight on error
    return [
      {
        type: 'neutral',
        category: 'general',
        message: 'Keep logging your health data daily to unlock personalized AI insights! 📊',
        priority: 1
      }
    ];
  }
}

/**
 * Generate fresh insights from Gemini API
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} Array of insight objects
 */
async function generateFreshInsights(userId) {
  try {
    // Step 1: Fetch health data
    console.log('📊 Fetching health data for user:', userId);
    const healthData = await getUserHealthData(userId);
    
    // Step 2: Generate insights using Gemini AI
    console.log('🤖 Generating AI insights...');
    const insights = await generateHealthInsights(healthData);
    
    console.log('✅ Generated', insights.length, 'insights from Gemini API');
    
    return insights;
    
  } catch (error) {
    console.error('Error generating fresh insights:', error);
    throw error;
  }
}

/**
 * Save insights to Firestore cache
 * 
 * @param {string} userId - Firebase user ID
 * @param {Array} insights - Array of insight objects
 */
async function saveToCache(userId, insights) {
  try {
    const cacheRef = doc(db, 'aiInsights', userId);
    
    await setDoc(cacheRef, {
      insights,
      timestamp: serverTimestamp(),
      userId,
      version: '1.0',
      generatedBy: 'gemini-2.0-flash-exp'
    });
    
    console.log('💾 Insights saved to cache');
    
    // Save weekly snapshot if needed
    const shouldSave = await shouldCreateSnapshot(userId);
    if (shouldSave && insights.length > 0) {
      await saveInsightsSnapshot(userId, insights);
    }
    
  } catch (error) {
    console.error('Error saving to cache:', error);
    // Non-critical error - insights are still generated
  }
}

/**
 * Clear cached insights for a user
 * 
 * @param {string} userId - Firebase user ID
 */
export async function clearInsightsCache(userId) {
  try {
    const cacheRef = doc(db, 'aiInsights', userId);
    
    await setDoc(cacheRef, {
      insights: [],
      timestamp: serverTimestamp(),
      userId,
      cleared: true
    });
    
    console.log('🗑️ Insights cache cleared');
    
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache metadata (timestamp, age)
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Object>} Cache metadata
 */
export async function getCacheMetadata(userId) {
  try {
    const cacheRef = doc(db, 'aiInsights', userId);
    const cacheDoc = await getDoc(cacheRef);
    
    if (!cacheDoc.exists()) {
      return {
        exists: false,
        lastGenerated: null,
        ageInDays: null,
        isValid: false
      };
    }
    
    const data = cacheDoc.data();
    const lastGenerated = data.timestamp?.toDate();
    const now = new Date();
    const ageInMs = lastGenerated ? now - lastGenerated : null;
    const ageInDays = ageInMs ? ageInMs / (1000 * 60 * 60 * 24) : null;
    const isValid = ageInMs ? ageInMs < CACHE_DURATION_MS : false;
    
    return {
      exists: true,
      lastGenerated,
      ageInDays: ageInDays ? Math.round(ageInDays * 10) / 10 : null,
      isValid,
      insightsCount: data.insights?.length || 0,
      version: data.version || 'unknown',
      generatedBy: data.generatedBy || 'unknown'
    };
    
  } catch (error) {
    console.error('Error getting cache metadata:', error);
    return {
      exists: false,
      error: error.message
    };
  }
}

/**
 * Check if cache is valid without fetching insights
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<boolean>} True if cache is valid
 */
export async function isCacheValid(userId) {
  const metadata = await getCacheMetadata(userId);
  return metadata.isValid;
}

/**
 * Get cache age in human-readable format
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string>} Human-readable cache age
 */
export async function getCacheAge(userId) {
  const metadata = await getCacheMetadata(userId);
  
  if (!metadata.exists) {
    return 'No cache';
  }
  
  if (!metadata.ageInDays) {
    return 'Unknown';
  }
  
  if (metadata.ageInDays < 1) {
    const hours = Math.round(metadata.ageInDays * 24);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  const days = Math.round(metadata.ageInDays);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

/**
 * Force refresh insights (bypass cache)
 * 
 * @param {string} userId - Firebase user ID
 * @returns {Promise<Array>} Array of fresh insight objects
 */
export async function refreshInsights(userId) {
  return getCachedInsights(userId, true);
}
