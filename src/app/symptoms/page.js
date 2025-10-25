'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SymptomsPage() {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const commonSymptoms = [
    'Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea',
    'Sore Throat', 'Runny Nose', 'Body Aches', 'Shortness of Breath',
    'Chest Pain', 'Dizziness', 'Abdominal Pain'
  ];

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = async () => {
    setLoading(true);
    
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
        // Fallback to basic analysis if no API key
        setResult({
          description: `You are experiencing: ${selectedSymptoms.join(', ')}`,
          selfCare: [
            'Rest and stay hydrated',
            'Monitor your symptoms',
            'Take over-the-counter medication as needed',
            'Avoid strenuous activities'
          ],
          redFlags: [
            'Symptoms worsen or don\'t improve after 3 days',
            'High fever (above 103°F/39.4°C)',
            'Difficulty breathing',
            'Severe or persistent pain',
            'Signs of dehydration'
          ],
          disclaimer: 'This is general guidance. Consult a healthcare professional for personalized advice.'
        });
      } else {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `As a medical information assistant, provide guidance for someone experiencing these symptoms: ${selectedSymptoms.join(', ')}. Severity: ${severity}. Duration: ${duration}. 
                  
                  Please provide:
                  1. Brief description
                  2. Self-care recommendations (3-5 points)
                  3. Red flags requiring immediate medical attention (3-5 points)
                  
                  Format as JSON with keys: description, selfCare (array), redFlags (array).
                  Keep it concise and add a disclaimer that this is informational only.`
                }]
              }]
            })
          }
        );

        const data = await response.json();
        const textResponse = data.candidates[0]?.content?.parts[0]?.text || '';
        
        // Try to parse JSON from response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResult({
            ...parsed,
            disclaimer: 'This is informational guidance only. Always consult with a qualified healthcare professional for medical advice.'
          });
        } else {
          // Fallback if JSON parsing fails
          setResult({
            description: textResponse,
            selfCare: ['Consult with a healthcare professional'],
            redFlags: ['Symptoms worsen or persist'],
            disclaimer: 'This is informational guidance only. Always consult with a qualified healthcare professional.'
          });
        }
      }
      
      setStep(4);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setStep(1);
    setSelectedSymptoms([]);
    setSeverity('');
    setDuration('');
    setResult(null);
  };

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
            AI Symptom Checker
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Get AI-powered guidance for common symptoms
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-warning-900 dark:text-warning-200 mb-1">
                Medical Disclaimer
              </p>
              <p className="text-sm text-warning-800 dark:text-warning-300">
                This tool provides informational guidance only and is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or treatment. If you have a medical emergency, call emergency services immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="card p-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  Select Your Symptoms
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Choose all symptoms you're currently experiencing
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedSymptoms.includes(symptom)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <p className="font-medium">{symptom}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={selectedSymptoms.length === 0}
                  className="w-full btn-primary"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  Symptom Severity
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  How would you rate the severity of your symptoms?
                </p>

                <div className="space-y-3 mb-6">
                  {['Mild', 'Moderate', 'Severe'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSeverity(level)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        severity === level
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{level}</p>
                    </button>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!severity}
                    className="btn-primary flex-1"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">
                  Duration
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  How long have you been experiencing these symptoms?
                </p>

                <div className="space-y-3 mb-6">
                  {['Less than 24 hours', '1-3 days', '3-7 days', 'More than a week'].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        duration === dur
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                    >
                      <p className="font-medium text-slate-900 dark:text-white">{dur}</p>
                    </button>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <button onClick={() => setStep(2)} className="btn-outline flex-1">
                    Back
                  </button>
                  <button
                    onClick={analyzeSymptoms}
                    disabled={!duration || loading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <span>Get Guidance</span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && result && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <Stethoscope className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                      AI Guidance
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Based on your symptoms
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {result.description && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Overview
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{result.description}</p>
                    </div>
                  )}

                  {result.selfCare && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                        <Info className="w-5 h-5 text-primary-500" />
                        <span>Self-Care Recommendations</span>
                      </h3>
                      <ul className="space-y-2">
                        {result.selfCare.map((item, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-400">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.redFlags && (
                    <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-xl p-4">
                      <h3 className="font-semibold text-danger-900 dark:text-danger-200 mb-2 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Seek Immediate Care If:</span>
                      </h3>
                      <ul className="space-y-2">
                        {result.redFlags.map((flag, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-danger-600 dark:text-danger-400">•</span>
                            <span className="text-danger-800 dark:text-danger-300">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.disclaimer && (
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        {result.disclaimer}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={resetAnalysis}
                  className="w-full btn-primary mt-6"
                >
                  Start New Assessment
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
