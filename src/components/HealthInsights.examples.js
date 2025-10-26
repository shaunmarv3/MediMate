/**
 * HealthInsights Component - Usage Examples
 * 
 * How to use the refactored HealthInsights component with insights as props
 */

import HealthInsights from '@/components/HealthInsights';
import HealthInsightsContainer from '@/components/HealthInsightsContainer';

// ========================================
// EXAMPLE 1: Basic Usage with Container (Recommended)
// ========================================

function DashboardPage() {
  const user = useAuth(); // Get current user
  
  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      
      {/* Container handles data fetching */}
      <HealthInsightsContainer userId={user.uid} />
    </div>
  );
}

// ========================================
// EXAMPLE 2: Direct Component with Props
// ========================================

function DirectUsage() {
  const insights = [
    {
      type: 'positive',
      category: 'blood_pressure',
      message: 'Great job! Your blood pressure has improved by 5% this week.',
      priority: 1
    },
    {
      type: 'alert',
      category: 'glucose',
      message: 'Your glucose levels are trending higher than normal. Consider reviewing your diet.',
      priority: 2
    },
    {
      type: 'achievement',
      category: 'adherence',
      message: '🎉 Perfect medication adherence for 7 days straight!',
      priority: 1
    }
  ];
  
  return <HealthInsights insights={insights} loading={false} />;
}

// ========================================
// EXAMPLE 3: Loading State
// ========================================

function LoadingExample() {
  return <HealthInsights insights={[]} loading={true} />;
}

// ========================================
// EXAMPLE 4: Empty State
// ========================================

function EmptyExample() {
  return <HealthInsights insights={[]} loading={false} />;
}

// ========================================
// EXAMPLE 5: Custom Fetch with Callback
// ========================================

function CustomFetchExample() {
  const [user] = useAuth();
  
  const handleRefresh = (newInsights) => {
    console.log('Insights refreshed:', newInsights);
    // Send analytics event
    analytics.track('insights_refreshed', {
      count: newInsights.length,
      timestamp: new Date()
    });
  };
  
  return (
    <HealthInsightsContainer 
      userId={user.uid}
      onRefresh={handleRefresh}
    />
  );
}

// ========================================
// EXAMPLE 6: Manual Data Fetching
// ========================================

import { useState, useEffect } from 'react';
import { getUserHealthData } from '@/lib/healthDataFetcher';
import { generateHealthInsights } from '@/lib/healthInsightsGenerator';

function ManualFetchExample() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuth();
  
  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        
        // Fetch health data
        const healthData = await getUserHealthData(user.uid);
        
        // Generate insights
        const generated = await generateHealthInsights(healthData);
        
        setInsights(generated);
      } catch (error) {
        console.error('Failed to load insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (user?.uid) {
      loadInsights();
    }
  }, [user?.uid]);
  
  return <HealthInsights insights={insights} loading={loading} />;
}

// ========================================
// EXAMPLE 7: Filter Insights by Type
// ========================================

function FilteredInsights() {
  const [allInsights, setAllInsights] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const filteredInsights = allInsights.filter(insight => 
    filter === 'all' || insight.type === filter
  );
  
  return (
    <div>
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('positive')}>Positive</button>
        <button onClick={() => setFilter('alert')}>Alerts</button>
        <button onClick={() => setFilter('achievement')}>Achievements</button>
      </div>
      
      {/* Display filtered insights */}
      <HealthInsights insights={filteredInsights} loading={false} />
    </div>
  );
}

// ========================================
// EXAMPLE 8: Mock Data for Testing
// ========================================

const mockInsights = [
  {
    type: 'positive',
    category: 'heart_rate',
    message: 'Your resting heart rate has decreased by 3 bpm - excellent progress!',
    priority: 2
  },
  {
    type: 'improvement',
    category: 'sleep',
    message: 'Sleep quality improved by 15% this week. Keep up the bedtime routine!',
    priority: 2
  },
  {
    type: 'alert',
    category: 'weight',
    message: 'Weight has increased by 2 lbs this week. Consider reviewing your activity levels.',
    priority: 3
  },
  {
    type: 'neutral',
    category: 'overall',
    message: 'Your health metrics are stable. Continue monitoring regularly.',
    priority: 4
  },
  {
    type: 'achievement',
    category: 'steps',
    message: '🏆 You hit your step goal every day this week!',
    priority: 1
  }
];

function MockDataExample() {
  return <HealthInsights insights={mockInsights} loading={false} />;
}

// ========================================
// EXAMPLE 9: Integration with Dashboard
// ========================================

function FullDashboard() {
  const user = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Blood Pressure" value="120/80" />
        <StatCard title="Heart Rate" value="72 bpm" />
        <StatCard title="Weight" value="165 lbs" />
      </div>
      
      {/* AI Insights */}
      <HealthInsightsContainer 
        key={refreshKey}
        userId={user.uid}
        onRefresh={() => console.log('Insights updated')}
      />
      
      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <BloodPressureChart />
        <WeightChart />
      </div>
    </div>
  );
}

// ========================================
// EXAMPLE 10: Gradients Showcase
// ========================================

function GradientsShowcase() {
  const insights = [
    { type: 'positive', message: 'Positive gradient (emerald to cyan)' },
    { type: 'alert', message: 'Alert gradient (rose to red)' },
    { type: 'neutral', message: 'Neutral gradient (slate to zinc)' },
    { type: 'achievement', message: 'Achievement gradient (purple to pink)' },
    { type: 'improvement', message: 'Improvement gradient (blue to violet)' }
  ];
  
  return <HealthInsights insights={insights} loading={false} />;
}

// ========================================
// EXPORT ALL EXAMPLES
// ========================================

export {
  DashboardPage,
  DirectUsage,
  LoadingExample,
  EmptyExample,
  CustomFetchExample,
  ManualFetchExample,
  FilteredInsights,
  MockDataExample,
  FullDashboard,
  GradientsShowcase,
  mockInsights
};
