'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertCircle, Loader2, Sparkles, Send, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function SymptomsPage() {
  const [user] = useAuthState(auth);
  const [symptomInput, setSymptomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userHealthData, setUserHealthData] = useState({
    medications: [],
    latestMetrics: null,
    dataLoaded: false
  });
  const [apiUsage, setApiUsage] = useState({ count: 0, date: null, loading: true });

  // Check GLOBAL API usage limit (10 total queries per day across all users)
  const checkApiLimit = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      // Use a global counter instead of per-user
      const globalUsageRef = doc(db, 'globalApiUsage', 'gemini');
      const usageDoc = await getDoc(globalUsageRef);

      if (usageDoc.exists()) {
        const data = usageDoc.data();
        // Check if it's the same day
        if (data.date === today) {
          setApiUsage({ count: data.count, date: today, loading: false });
          return data.count < 10; // Global daily limit
        } else {
          // New day, reset counter
          await setDoc(globalUsageRef, { count: 0, date: today });
          setApiUsage({ count: 0, date: today, loading: false });
          return true;
        }
      } else {
        // First time use
        await setDoc(globalUsageRef, { count: 0, date: today });
        setApiUsage({ count: 0, date: today, loading: false });
        return true;
      }
    } catch (error) {
      console.error('Error checking API limit:', error);
      return true; // Allow on error
    }
  };

  // Increment GLOBAL API usage counter
  const incrementApiUsage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Use global counter
      const globalUsageRef = doc(db, 'globalApiUsage', 'gemini');
      await setDoc(globalUsageRef, {
        count: increment(1),
        date: today
      }, { merge: true });

      // Update local state
      setApiUsage(prev => ({ ...prev, count: prev.count + 1 }));
    } catch (error) {
      console.error('Error incrementing API usage:', error);
    }
  };

  // Fetch user's health data and check API limit
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!user) return;

      try {
        // Check API limit first
        await checkApiLimit();
        // Fetch medications from users/{userId}/medications subcollection
        const medicationsRef = collection(db, 'users', user.uid, 'medications');
        const medicationsSnapshot = await getDocs(medicationsRef);
        const medications = medicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch all metrics from users/{userId}/metrics subcollection
        const metricsRef = collection(db, 'users', user.uid, 'metrics');
        const metricsSnapshot = await getDocs(metricsRef);

        // Aggregate metrics by type, keeping the most recent for each type
        const metricsMap = {};
        metricsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const type = data.type;
          const timestamp = data.timestamp;

          if (!metricsMap[type] || timestamp > metricsMap[type].timestamp) {
            metricsMap[type] = {
              value: data.value,
              timestamp: timestamp
            };
          }
        });

        setUserHealthData({
          medications,
          latestMetrics: Object.keys(metricsMap).length > 0 ? metricsMap : null,
          dataLoaded: true
        });
      } catch (error) {
        console.error('Error fetching health data:', error);
        setUserHealthData(prev => ({ ...prev, dataLoaded: true }));
      }
    };

    fetchHealthData();
  }, [user]);

  const analyzeSymptoms = async (e) => {
    e.preventDefault();

    if (!symptomInput.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    // Check API limit before proceeding
    const canUseApi = await checkApiLimit();
    if (!canUseApi) {
      toast.error('Global daily limit reached! The AI symptom checker has reached its limit of 10 queries today. Please try again tomorrow.', {
        duration: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
        toast.error('Gemini API key not configured');
        setLoading(false);
        return;
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

      // Build personalized context
      let personalizedContext = '';

      if (userHealthData.dataLoaded) {
        // Add medication information if available
        if (userHealthData.medications && userHealthData.medications.length > 0) {
          const medicationList = userHealthData.medications
            .map(med => `${med.name} (${med.dosage}, ${med.schedule?.[0]?.repeat || 'as needed'})`)
            .join(', ');
          personalizedContext += `\n\nCurrent Medications: ${medicationList}`;
        }

        // Add latest health metrics if available
        if (userHealthData.latestMetrics) {
          const metrics = userHealthData.latestMetrics;
          const metricsList = [];

          if (metrics.weight) metricsList.push(`Weight: ${metrics.weight.value} kg`);
          if (metrics.heartRate) metricsList.push(`Heart Rate: ${metrics.heartRate.value} bpm`);
          if (metrics.bloodPressure) metricsList.push(`Blood Pressure: ${metrics.bloodPressure.value}`);
          if (metrics.steps) metricsList.push(`Daily Steps: ${metrics.steps.value}`);
          if (metrics.sleepHours) metricsList.push(`Sleep: ${metrics.sleepHours.value} hours`);
          if (metrics.bloodSugar) metricsList.push(`Blood Sugar: ${metrics.bloodSugar.value} mg/dL`);
          if (metrics.oxygen) metricsList.push(`Oxygen Level: ${metrics.oxygen.value}%`);

          if (metricsList.length > 0) {
            personalizedContext += `\n\nRecent Health Metrics: ${metricsList.join(', ')}`;
          }
        }
      }

      const promptText = personalizedContext
        ? `You are a medical information assistant. Analyze these symptoms with PERSONALIZED guidance:

${symptomInput}
${personalizedContext}

Provide a complete response with ALL sections below. Consider medications and health metrics:

1. Symptom Analysis (consider patient's health profile)
2. Possible Causes (possibilities, not diagnosis)
3. Medication Considerations (check side effects/interactions with current meds)
4. Food Recommendations (what to eat and avoid)
5. Self-Care Tips (tailored to health profile)
6. When to Seek Medical Attention

FORMAT: No markdown (**,##,---). Use dashes (-) for bullets. Number sections (1.,2.,3.). Keep clear and structured.`
        : `You are a medical information assistant. Analyze these symptoms:

${symptomInput}

Provide a complete response with ALL sections:

1. Symptom Analysis
2. Possible Causes (possibilities, not diagnosis)
3. Food Recommendations (what to eat and avoid)
4. Self-Care Tips
5. When to Seek Medical Attention

FORMAT: No markdown (**,##,---). Use dashes (-) for bullets. Number sections (1.,2.,3.). Keep clear and structured.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: promptText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error?.message || 'Failed to get response from Gemini AI');
      }

      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const finishReason = data.candidates?.[0]?.finishReason;

      // Check if response was cut off
      if (finishReason === 'MAX_TOKENS') {
        console.warn('Response was truncated due to token limit');
        toast.warning('Response was very long and may be incomplete. Consider asking more specific questions.');
      }

      if (textResponse) {
        // Clean up markdown formatting
        const cleanedResponse = textResponse
          .replace(/\*\*/g, '')           // Remove bold **
          .replace(/\*/g, '')             // Remove italic *
          .replace(/###/g, '')            // Remove ### headers
          .replace(/##/g, '')             // Remove ## headers
          .replace(/#/g, '')              // Remove # headers
          .replace(/---/g, '')            // Remove horizontal lines
          .replace(/\n{3,}/g, '\n\n');    // Replace multiple newlines with double newline

        setResult(cleanedResponse);

        // Increment API usage count after successful response
        await incrementApiUsage();
      } else {
        throw new Error('No response generated');
      }

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error(error.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSymptomInput('');
    setResult(null);
  };

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-linear-to-br from-cyan-500 to-purple-600 rounded-xl">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                AI Symptom Checker
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Powered by Google Gemini AI
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8"
        >
          {!result ? (
            <>
              <div className="flex items-start space-x-3 mb-6">
                <Sparkles className="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
                    Describe Your Symptoms
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Tell us what you're experiencing. Be as detailed as possible for better guidance.
                  </p>
                </div>
              </div>

              {/* Personalization Status */}
              {userHealthData.dataLoaded && (userHealthData.medications.length > 0 || userHealthData.latestMetrics) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                        Personalized Analysis Enabled
                      </p>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
                        AI will consider your {userHealthData.medications.length > 0 && 'medications'}
                        {userHealthData.medications.length > 0 && userHealthData.latestMetrics && ' and '}
                        {userHealthData.latestMetrics && 'health metrics'} for better recommendations
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* API Usage Counter */}
              {!apiUsage.loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-6 p-4 rounded-xl border ${apiUsage.count >= 10
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : apiUsage.count >= 7
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className={`w-5 h-5 ${apiUsage.count >= 10
                        ? 'text-red-600 dark:text-red-400'
                        : apiUsage.count >= 7
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-600 dark:text-slate-400'
                        }`} />
                      <div>
                        <p className={`text-sm font-medium ${apiUsage.count >= 10
                          ? 'text-red-900 dark:text-red-100'
                          : apiUsage.count >= 7
                            ? 'text-amber-900 dark:text-amber-100'
                            : 'text-slate-900 dark:text-slate-100'
                          }`}>
                          AI Usage Today
                        </p>
                        <p className={`text-xs mt-0.5 ${apiUsage.count >= 10
                          ? 'text-red-700 dark:text-red-300'
                          : apiUsage.count >= 7
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-slate-600 dark:text-slate-400'
                          }`}>
                          {apiUsage.count >= 10
                            ? 'Daily limit reached. Resets tomorrow.'
                            : `${apiUsage.count} of 10 queries used`
                          }
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${apiUsage.count >= 10
                      ? 'text-red-600 dark:text-red-400'
                      : apiUsage.count >= 7
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-600 dark:text-slate-400'
                      }`}>
                      {10 - apiUsage.count}
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={analyzeSymptoms} className="space-y-6">
                <div>
                  <label className="label">
                    What symptoms are you experiencing?
                  </label>
                  <textarea
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    className="input-field"
                    placeholder="Example: I've been having a persistent headache for the past 2 days, along with mild fever and fatigue..."
                    rows={8}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Include details like duration, severity, and any other relevant information
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !symptomInput.trim()}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing your symptoms...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Get AI Guidance</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <Stethoscope className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                      AI Analysis & Guidance
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Based on your symptoms
                    </p>
                  </div>
                </div>

                {/* Personalization Badge */}
                {userHealthData.dataLoaded && (userHealthData.medications.length > 0 || userHealthData.latestMetrics) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700 rounded-full"
                  >
                    <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">
                      Personalized
                    </span>
                  </motion.div>
                )}
              </div>

              {/* AI Response */}
              <div className="bg-linear-to-br from-slate-50 to-cyan-50/30 dark:from-slate-900/50 dark:to-cyan-900/10 rounded-xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-slate-800 dark:text-slate-200 leading-loose space-y-4" style={{ fontSize: '15px', lineHeight: '1.8' }}>
                  {result.split('\n').map((line, index) => {
                    // Skip empty lines
                    if (!line.trim()) return <div key={index} className="h-2"></div>;

                    // Main numbered sections (1., 2., 3., etc.)
                    if (/^\d+\./.test(line.trim())) {
                      return (
                        <div key={index} className="font-semibold text-cyan-700 dark:text-cyan-400 text-lg mt-6 mb-2">
                          {line}
                        </div>
                      );
                    }

                    // Bullet points or list items starting with -
                    if (line.trim().startsWith('-')) {
                      return (
                        <div key={index} className="ml-6 flex items-start space-x-2">
                          <span className="text-cyan-500 dark:text-cyan-400 mt-1">•</span>
                          <span className="flex-1">{line.replace(/^-\s*/, '')}</span>
                        </div>
                      );
                    }

                    // Regular paragraphs
                    return (
                      <div key={index} className="text-slate-700 dark:text-slate-300">
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Medical Disclaimer Box */}
              <div className="bg-warning-50 dark:bg-warning-900/20 border-2 border-warning-200 dark:border-warning-800 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-warning-900 dark:text-warning-200 mb-2 text-lg">
                      Medical Disclaimer
                    </h3>
                    <p className="text-sm text-warning-800 dark:text-warning-300 leading-relaxed">
                      This tool provides informational guidance only and is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. If you have a medical emergency, call emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={resetAnalysis}
                className="w-full btn-outline"
              >
                Check New Symptoms
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
