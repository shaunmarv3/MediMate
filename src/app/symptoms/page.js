'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function SymptomsPage() {
  const [symptomInput, setSymptomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeSymptoms = async (e) => {
    e.preventDefault();

    if (!symptomInput.trim()) {
      toast.error('Please describe your symptoms');
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

      const requestBody = {
        contents: [{
          parts: [{
            text: `As a medical information assistant, analyze the following symptoms and provide helpful guidance:

Symptoms: ${symptomInput}

Please provide a comprehensive response including:
1. Brief analysis of the symptoms
2. Possible causes (mention these are possibilities, not a diagnosis)
3. Self-care recommendations
4. When to seek immediate medical attention

Keep the response clear, concise, and easy to understand. Format it in a structured way with clear sections.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
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

      if (textResponse) {
        setResult(textResponse);
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
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
                    Describe Your Symptoms
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Tell us what you're experiencing. Be as detailed as possible for better guidance.
                  </p>
                </div>
              </div>

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
              <div className="flex items-center justify-between mb-4">
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
              </div>

              {/* AI Response */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {result}
                  </div>
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
