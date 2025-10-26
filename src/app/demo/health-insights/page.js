'use client';

import HealthInsights from '@/components/HealthInsights';

/**
 * Visual Demo of HealthInsights Component
 * 
 * This page demonstrates all gradient colors and animation types
 */
export default function HealthInsightsDemo() {
  // Mock insights showcasing all gradient types
  const demoInsights = [
    {
      type: 'achievement',
      category: 'adherence',
      message: '🎉 Incredible! You\'ve maintained 100% medication adherence for 30 days straight. This consistency is the foundation of better health!',
      priority: 1
    },
    {
      type: 'positive',
      category: 'blood_pressure',
      message: '📉 Excellent progress! Your blood pressure has improved by 8% over the past two weeks. Your systolic readings are now consistently in the healthy range.',
      priority: 2
    },
    {
      type: 'improvement',
      category: 'sleep',
      message: '😴 Sleep quality is trending upward! You\'re averaging 7.5 hours per night this week - up from 6.2 hours last month. Keep up that bedtime routine!',
      priority: 2
    },
    {
      type: 'alert',
      category: 'glucose',
      message: '⚠️ Your glucose levels have been trending higher than your target range (average 145 mg/dL vs target 120 mg/dL). Consider reviewing your carbohydrate intake.',
      priority: 3
    },
    {
      type: 'neutral',
      category: 'overall',
      message: '📊 Your health metrics are stable overall. Continue monitoring regularly and logging your daily measurements for personalized insights.',
      priority: 4
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white">
            🧠 AI Health Insights
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Beautiful gradient cards powered by Gemini AI
          </p>
        </div>

        {/* Main Component */}
        <HealthInsights insights={demoInsights} loading={false} />

        {/* Gradient Legend */}
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Gradient Color Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Positive</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Emerald → Teal → Cyan</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-red-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Alert</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Rose → Pink → Red</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Neutral</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Slate → Gray → Zinc</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Achievement</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Purple → Fuchsia → Pink</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Improvement</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Blue → Indigo → Violet</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animation Features */}
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Animation Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 dark:text-slate-300">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold">Fade-in Animation</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Smooth opacity transition on load
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">↗️</span>
              <div>
                <p className="font-semibold">Slide-in from Left</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cards slide in with X-axis translation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="font-semibold">Staggered Timing</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Each card delays by 0.1s for cascade effect
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-semibold">Hover Scale</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cards scale up 2% on hover
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎾</span>
              <div>
                <p className="font-semibold">Spring Physics</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Natural bounce effect with spring animation
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌑</span>
              <div>
                <p className="font-semibold">Dark Mode Support</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Automatic color adaptation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Loading State
          </h2>
          <HealthInsights insights={[]} loading={true} />
        </div>

        {/* Empty State Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Empty State
          </h2>
          <HealthInsights insights={[]} loading={false} />
        </div>

        {/* Code Example */}
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Usage Example
          </h2>
          
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import HealthInsights from '@/components/HealthInsights';

const insights = [
  {
    type: 'positive',
    category: 'blood_pressure',
    message: 'Blood pressure improved by 5%!',
    priority: 1
  }
];

<HealthInsights insights={insights} loading={false} />`}
          </pre>
        </div>
      </div>
    </div>
  );
}
