/**
 * AI Health Insights Generator
 * Uses Google Gemini Pro API to analyze user health data and generate personalized insights
 */

/**
 * Generate AI-powered health insights from user health data
 * @param {Object} data - User health data from getUserHealthData()
 * @param {Array} data.metrics - Health metrics array
 * @param {Object} data.metricsByType - Metrics organized by type
 * @param {Array} data.medications - Active medications
 * @param {Object} data.adherenceStats - Adherence statistics
 * @param {Object} data.dateRange - Date range of data
 * @returns {Promise<Array>} Array of insight objects
 */
export async function generateHealthInsights(data) {
  if (!data || !data.metrics) {
    throw new Error('Health data is required');
  }

  try {
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured');
      return getFallbackInsights(data);
    }

    // Prepare comprehensive health context
    const healthContext = buildHealthContext(data);
    
    // Debug logging
    console.log('Health context length:', healthContext.length);
    console.log('Health context preview:', healthContext.substring(0, 500));

    // Call Gemini API (using the latest available model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `You are a compassionate health insights AI assistant. Analyze the user's last 30 days of health data and provide 3-5 personalized insights.

${healthContext}

Instructions:
- Identify improvements and celebrate progress
- Gently highlight areas needing attention
- Recognize positive behavior patterns
- Focus on trends, not single data points
- Be supportive, encouraging, and friendly
- Avoid medical diagnosis or prescriptive advice

Analyze specifically:
1. Blood pressure trends (if available)
2. Glucose stability (if available)
3. Medication adherence rate and consistency
4. Overall wellness patterns and activity
5. Weight/BMI trends (if available)
6. Sleep patterns (if available)

Return ONLY a JSON array with 3-5 insights in this EXACT format:
[
  {
    "type": "positive" | "alert" | "achievement" | "neutral" | "improvement",
    "category": "adherence" | "blood_pressure" | "glucose" | "weight" | "sleep" | "activity" | "overall",
    "message": "Clear, friendly insight message (max 25 words)",
    "priority": 1-5
  }
]

Insight Types:
- "positive": Good trends, improvements (green)
- "achievement": Milestones reached (purple/gold)
- "improvement": Getting better (blue)
- "alert": Needs attention, gentle warning (orange/yellow)
- "neutral": General observations, tips (gray)

Examples:
[
  {
    "type": "achievement",
    "category": "adherence",
    "message": "Fantastic! 95% medication adherence - you're crushing your health goals!",
    "priority": 1
  },
  {
    "type": "positive",
    "category": "blood_pressure",
    "message": "Your blood pressure has improved 5% this week - great progress!",
    "priority": 2
  },
  {
    "type": "alert",
    "category": "glucose",
    "message": "Glucose readings are trending higher. Consider discussing this with your doctor.",
    "priority": 3
  },
  {
    "type": "improvement",
    "category": "sleep",
    "message": "Sleep hours increased by 1 hour - better rest supports healing!",
    "priority": 4
  }
]

Remember: Be supportive and empowering. Focus on what the user IS doing well, not just problems.

Return ONLY the JSON array, no markdown formatting.`
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      throw new Error(errorData.error?.message || `API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Debug logging
    console.log('Gemini API Response:', JSON.stringify(responseData, null, 2));
    
    // Check if response was blocked by safety filters
    const candidate = responseData.candidates?.[0];
    if (!candidate) {
      console.error('No candidates in response:', responseData);
      throw new Error('No response candidates from AI');
    }
    
    const finishReason = candidate.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      console.error('Response blocked or incomplete. Finish reason:', finishReason);
      console.error('Safety ratings:', candidate.safetyRatings);
      throw new Error(`AI response blocked: ${finishReason}`);
    }
    
    const textResponse = candidate.content?.parts?.[0]?.text || '';

    if (!textResponse) {
      console.error('Empty text in response candidate:', candidate);
      throw new Error('Empty response from AI');
    }

    // Clean and parse JSON response
    const cleanedResponse = cleanResponse(textResponse);
    const insights = JSON.parse(cleanedResponse);

    // Validate and sanitize insights
    const validatedInsights = validateInsights(insights);

    // Sort by priority
    validatedInsights.sort((a, b) => a.priority - b.priority);

    return validatedInsights;

  } catch (error) {
    console.error('Error generating health insights:', error);
    
    // Return fallback insights on error
    return getFallbackInsights(data);
  }
}

/**
 * Build comprehensive health context for AI
 * @private
 */
function buildHealthContext(data) {
  const {
    metrics = [],
    metricsByType = {},
    medications = [],
    adherenceStats = {},
    dateRange = {}
  } = data;

  // Calculate trends
  const trends = calculateTrends(metricsByType);

  // Build context string
  let context = `
📊 HEALTH DATA SUMMARY (Last 30 Days):
Period: ${formatDate(dateRange.startDate)} to ${formatDate(dateRange.endDate)}

💊 MEDICATION ADHERENCE:
- Adherence Rate: ${adherenceStats.adherenceRate || 0}%
- Doses Taken: ${adherenceStats.dosesTaken || 0} / ${adherenceStats.totalExpectedDoses || 0}
- Missed Doses: ${adherenceStats.missedDoses || 0}
- Active Medications: ${medications.length}
${medications.length > 0 ? `- Current Medications: ${medications.map(m => m.name).join(', ')}` : ''}

📈 HEALTH METRICS:
- Total Readings: ${metrics.length}
- Days with Activity: ${countActiveDays(metrics)}
`;

  // Add metric-specific trends
  if (metricsByType.bloodPressure && metricsByType.bloodPressure.length > 0) {
    const bpTrend = trends.bloodPressure;
    if (bpTrend && bpTrend.direction) {
      context += `\n🩺 Blood Pressure:
- Readings: ${metricsByType.bloodPressure.length}
- Trend: ${bpTrend.direction} ${bpTrend.percentage}%
- Recent Average: ${bpTrend.recentAvg}/${bpTrend.recentAvgDiastolic || 'N/A'}
- Previous Average: ${bpTrend.previousAvg}/${bpTrend.previousAvgDiastolic || 'N/A'}`;
    }
  }

  if (metricsByType.glucose && metricsByType.glucose.length > 0) {
    const glucoseTrend = trends.glucose;
    if (glucoseTrend && glucoseTrend.direction) {
      context += `\n🍬 Blood Glucose:
- Readings: ${metricsByType.glucose.length}
- Trend: ${glucoseTrend.direction} ${glucoseTrend.percentage}%
- Recent Average: ${glucoseTrend.recentAvg} mg/dL
- Range: ${glucoseTrend.min} - ${glucoseTrend.max} mg/dL`;
    }
  }

  if (metricsByType.weight && metricsByType.weight.length > 0) {
    const weightTrend = trends.weight;
    if (weightTrend && weightTrend.direction) {
      context += `\n⚖️ Weight:
- Readings: ${metricsByType.weight.length}
- Trend: ${weightTrend.direction} ${weightTrend.percentage}%
- Recent Average: ${weightTrend.recentAvg} kg
- Change: ${weightTrend.change > 0 ? '+' : ''}${weightTrend.change} kg`;
    }
  }

  if (metricsByType.heartRate && metricsByType.heartRate.length > 0) {
    const hrTrend = trends.heartRate;
    if (hrTrend && hrTrend.direction) {
      context += `\n❤️ Heart Rate:
- Readings: ${metricsByType.heartRate.length}
- Trend: ${hrTrend.direction} ${hrTrend.percentage}%
- Recent Average: ${hrTrend.recentAvg} bpm`;
    }
  }

  if (metricsByType.sleepHours && metricsByType.sleepHours.length > 0) {
    const sleepTrend = trends.sleepHours;
    if (sleepTrend && sleepTrend.direction) {
      context += `\n😴 Sleep:
- Readings: ${metricsByType.sleepHours.length}
- Trend: ${sleepTrend.direction} ${sleepTrend.percentage}%
- Recent Average: ${sleepTrend.recentAvg} hours`;
    }
  }

  if (metricsByType.steps && metricsByType.steps.length > 0) {
    const stepsTrend = trends.steps;
    if (stepsTrend && stepsTrend.direction) {
      context += `\n👟 Activity (Steps):
- Readings: ${metricsByType.steps.length}
- Trend: ${stepsTrend.direction} ${stepsTrend.percentage}%
- Recent Average: ${stepsTrend.recentAvg} steps/day`;
    }
  }

  if (metricsByType.oxygen && metricsByType.oxygen.length > 0) {
    const oxygenTrend = trends.oxygen;
    if (oxygenTrend && oxygenTrend.recentAvg) {
      context += `\n🫁 Oxygen Saturation:
- Readings: ${metricsByType.oxygen.length}
- Recent Average: ${oxygenTrend.recentAvg}%`;
    }
  }

  return context.trim();
}

/**
 * Calculate trends for each metric type
 * @private
 */
function calculateTrends(metricsByType) {
  const trends = {};

  Object.entries(metricsByType).forEach(([type, readings]) => {
    if (readings.length < 2) return;

    const recentCount = Math.min(7, Math.floor(readings.length / 2));
    const recent = readings.slice(0, recentCount);
    const previous = readings.slice(recentCount, recentCount * 2);

    if (previous.length === 0) return;

    if (type === 'bloodPressure') {
      const recentSystolic = recent.map(r => r.value.systolic).filter(v => v);
      const recentDiastolic = recent.map(r => r.value.diastolic).filter(v => v);
      const prevSystolic = previous.map(r => r.value.systolic).filter(v => v);
      const prevDiastolic = previous.map(r => r.value.diastolic).filter(v => v);

      const recentAvgSys = average(recentSystolic);
      const prevAvgSys = average(prevSystolic);
      const change = ((recentAvgSys - prevAvgSys) / prevAvgSys) * 100;

      trends[type] = {
        direction: change > 0 ? 'up' : 'down',
        percentage: Math.abs(change).toFixed(1),
        recentAvg: Math.round(recentAvgSys),
        previousAvg: Math.round(prevAvgSys),
        recentAvgDiastolic: Math.round(average(recentDiastolic)),
        previousAvgDiastolic: Math.round(average(prevDiastolic))
      };
    } else {
      const recentValues = recent.map(r => r.value).filter(v => typeof v === 'number');
      const prevValues = previous.map(r => r.value).filter(v => typeof v === 'number');

      const recentAvg = average(recentValues);
      const prevAvg = average(prevValues);
      const change = prevAvg !== 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : 0;

      trends[type] = {
        direction: change > 0 ? 'up' : 'down',
        percentage: Math.abs(change).toFixed(1),
        recentAvg: Math.round(recentAvg * 10) / 10,
        previousAvg: Math.round(prevAvg * 10) / 10,
        min: Math.min(...recentValues),
        max: Math.max(...recentValues),
        change: Math.round((recentAvg - prevAvg) * 10) / 10
      };
    }
  });

  return trends;
}

/**
 * Calculate average of numeric array
 * @private
 */
function average(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Count active days (days with at least one metric)
 * @private
 */
function countActiveDays(metrics) {
  const uniqueDates = new Set(
    metrics.map(m => m.timestamp.split('T')[0])
  );
  return uniqueDates.size;
}

/**
 * Format ISO date to readable format
 * @private
 */
function formatDate(isoDate) {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Clean AI response (remove markdown, extra whitespace)
 * @private
 */
function cleanResponse(text) {
  return text
    .trim()
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^\s+|\s+$/g, '');
}

/**
 * Validate and sanitize insights array
 * @private
 */
function validateInsights(insights) {
  if (!Array.isArray(insights)) {
    throw new Error('Insights must be an array');
  }

  const validTypes = ['positive', 'alert', 'achievement', 'neutral', 'improvement'];
  const validCategories = ['adherence', 'blood_pressure', 'glucose', 'weight', 'sleep', 'activity', 'overall'];

  return insights
    .filter(insight => {
      // Validate required fields
      if (!insight.type || !insight.message) return false;
      if (!validTypes.includes(insight.type)) return false;
      return true;
    })
    .map(insight => ({
      type: insight.type,
      category: validCategories.includes(insight.category) ? insight.category : 'overall',
      message: insight.message.trim().slice(0, 200), // Max 200 chars
      priority: typeof insight.priority === 'number' ? insight.priority : 3
    }))
    .slice(0, 5); // Max 5 insights
}

/**
 * Generate fallback insights when AI is unavailable
 * @private
 */
function getFallbackInsights(data) {
  const insights = [];
  const { adherenceStats = {}, metricsByType = {}, medications = [] } = data;

  // Adherence insight
  if (adherenceStats.adherenceRate !== undefined) {
    const rate = adherenceStats.adherenceRate;
    
    if (rate >= 90) {
      insights.push({
        type: 'achievement',
        category: 'adherence',
        message: `Excellent! ${rate}% medication adherence - you're doing great!`,
        priority: 1
      });
    } else if (rate >= 75) {
      insights.push({
        type: 'positive',
        category: 'adherence',
        message: `Good progress! ${rate}% adherence. Keep up the consistent routine.`,
        priority: 1
      });
    } else if (rate < 75) {
      insights.push({
        type: 'alert',
        category: 'adherence',
        message: `Adherence is ${rate}%. Try setting daily reminders to stay on track.`,
        priority: 1
      });
    }
  }

  // Activity insight
  if (metricsByType.steps && metricsByType.steps.length > 0) {
    const avgSteps = Math.round(
      average(metricsByType.steps.map(s => s.value).filter(v => typeof v === 'number'))
    );
    
    if (avgSteps >= 8000) {
      insights.push({
        type: 'positive',
        category: 'activity',
        message: `Great activity! Averaging ${avgSteps.toLocaleString()} steps per day.`,
        priority: 2
      });
    }
  }

  // General encouragement
  if (medications.length > 0) {
    insights.push({
      type: 'neutral',
      category: 'overall',
      message: `Managing ${medications.length} medication${medications.length > 1 ? 's' : ''} - you're taking charge of your health!`,
      priority: 3
    });
  }

  // If no insights, add generic one
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      category: 'overall',
      message: 'Keep logging your health data to unlock personalized insights!',
      priority: 1
    });
  }

  return insights;
}

/**
 * Get insight icon based on type
 * @param {string} type - Insight type
 * @returns {string} Icon name for lucide-react
 */
export function getInsightIcon(type) {
  const iconMap = {
    positive: 'trending_up',
    alert: 'alert',
    achievement: 'sparkles',
    improvement: 'trending_up',
    neutral: 'heart'
  };
  return iconMap[type] || 'heart';
}

/**
 * Get insight color class based on type
 * @param {string} type - Insight type
 * @returns {string} Tailwind gradient class
 */
export function getInsightColor(type) {
  const colorMap = {
    positive: 'from-success-500 to-success-600',
    alert: 'from-warning-500 to-warning-600',
    achievement: 'from-purple-500 to-pink-600',
    improvement: 'from-cyan-500 to-blue-600',
    neutral: 'from-slate-500 to-slate-600'
  };
  return colorMap[type] || 'from-slate-500 to-slate-600';
}
