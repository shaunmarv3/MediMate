# 🧠 HealthInsights Component Documentation

## Overview

The **HealthInsights** component displays AI-generated health insights in beautiful gradient cards with smooth animations. It's designed to accept insights as props, making it flexible and reusable.

---

## 📦 Component Structure

```
HealthInsights.js           → Pure presentation component (accepts props)
HealthInsightsContainer.js  → Data fetching wrapper (recommended)
HealthInsights.examples.js  → 10 usage examples
```

---

## 🎯 Core Component: `HealthInsights`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `insights` | `Array` | `[]` | Array of insight objects from Gemini API |
| `loading` | `Boolean` | `false` | Loading state to show skeleton |

### Insight Object Structure

```javascript
{
  type: 'positive' | 'alert' | 'neutral' | 'achievement' | 'improvement',
  category: string,        // e.g., 'blood_pressure', 'glucose', 'adherence'
  message: string,         // The insight message to display
  priority: number         // 1 = highest priority
}
```

### Usage

```javascript
import HealthInsights from '@/components/HealthInsights';

function MyComponent() {
  const insights = [
    {
      type: 'positive',
      category: 'blood_pressure',
      message: 'Your blood pressure has improved by 5% this week!',
      priority: 1
    }
  ];
  
  return <HealthInsights insights={insights} loading={false} />;
}
```

---

## 🔄 Container Component: `HealthInsightsContainer`

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userId` | `String` | ✅ Yes | Current user's Firebase UID |
| `onRefresh` | `Function` | ❌ No | Callback when insights are refreshed |

### What It Does

1. **Fetches** 30-day health data using `getUserHealthData(userId)`
2. **Generates** AI insights using `generateHealthInsights(healthData)`
3. **Passes** insights to `HealthInsights` component
4. **Handles** loading and error states
5. **Provides** refresh button

### Usage (Recommended)

```javascript
import HealthInsightsContainer from '@/components/HealthInsightsContainer';

function Dashboard() {
  const user = useAuth();
  
  return (
    <div>
      <HealthInsightsContainer userId={user.uid} />
    </div>
  );
}
```

---

## 🎨 Gradient Colors by Type

The component automatically applies beautiful gradients based on insight type:

| Type | Gradient | Use Case |
|------|----------|----------|
| `positive` | Emerald → Teal → Cyan | Good progress, improvements |
| `alert` | Rose → Pink → Red | Warnings, concerning trends |
| `neutral` | Slate → Gray → Zinc | General info, stable metrics |
| `achievement` | Purple → Fuchsia → Pink | Milestones, achievements |
| `improvement` | Blue → Indigo → Violet | Behavioral improvements |

### Visual Example

```javascript
// Positive (Green gradient)
{ type: 'positive', message: 'Blood pressure improved!' }

// Alert (Red gradient)
{ type: 'alert', message: 'Glucose trending high' }

// Achievement (Purple-pink gradient)
{ type: 'achievement', message: '🎉 7-day adherence streak!' }
```

---

## 🎬 Animations

The component includes multiple animation types:

### 1. **Container Fade-in**
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

### 2. **Staggered Card Animation**
```javascript
transition={{ delay: index * 0.1 }}  // Each card delays by 0.1s
```

### 3. **Slide-in from Left**
```javascript
initial={{ opacity: 0, x: -20, scale: 0.95 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
```

### 4. **Hover Scale Effect**
```javascript
whileHover={{ scale: 1.02 }}
```

### 5. **Spring Physics**
```javascript
transition={{
  type: 'spring',
  stiffness: 100
}}
```

---

## 💀 Loading Skeleton

When `loading={true}`, displays animated skeleton:

```javascript
<LoadingSkeleton />
```

**Features:**
- 3 placeholder cards
- Pulsing animation
- Matches card dimensions
- Dark mode support

---

## 📱 Responsive Design

The component is fully responsive:

- **Mobile**: Stacks vertically, full width
- **Tablet**: Maintains padding and spacing
- **Desktop**: Optimal card width with hover effects

---

## 🌙 Dark Mode Support

All colors automatically adapt to dark mode:

```javascript
// Light mode
bg-slate-200 text-slate-900

// Dark mode
dark:bg-slate-700 dark:text-white
```

---

## 🎯 Icon Mapping

Icons are automatically assigned based on insight type:

| Type | Icon | Lucide Component |
|------|------|------------------|
| `positive` | ↗️ | `TrendingUp` |
| `alert` | ⚠️ | `AlertCircle` |
| `neutral` | 🧠 | `Brain` |
| `achievement` | 🏆 | `Award` |
| `improvement` | 📈 | `Activity` |
| Default | ❤️ | `Heart` |

---

## 📊 Real-World Examples

### Example 1: Basic Dashboard Integration

```javascript
import HealthInsightsContainer from '@/components/HealthInsightsContainer';

function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1>My Health Dashboard</h1>
      <HealthInsightsContainer userId={user.uid} />
    </div>
  );
}
```

### Example 2: With Refresh Callback

```javascript
function Dashboard() {
  const handleRefresh = (insights) => {
    console.log(`Loaded ${insights.length} insights`);
    toast.success('Insights refreshed!');
  };
  
  return (
    <HealthInsightsContainer 
      userId={user.uid}
      onRefresh={handleRefresh}
    />
  );
}
```

### Example 3: Manual Fetching

```javascript
import { useState, useEffect } from 'react';
import { getUserHealthData } from '@/lib/healthDataFetcher';
import { generateHealthInsights } from '@/lib/healthInsightsGenerator';
import HealthInsights from '@/components/HealthInsights';

function CustomDashboard() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function load() {
      const data = await getUserHealthData(user.uid);
      const generated = await generateHealthInsights(data);
      setInsights(generated);
      setLoading(false);
    }
    
    load();
  }, []);
  
  return <HealthInsights insights={insights} loading={loading} />;
}
```

### Example 4: Mock Data for Testing

```javascript
const mockInsights = [
  {
    type: 'achievement',
    category: 'adherence',
    message: '🎉 Perfect medication adherence for 30 days!',
    priority: 1
  },
  {
    type: 'positive',
    category: 'blood_pressure',
    message: 'Blood pressure trending downward - great progress!',
    priority: 2
  },
  {
    type: 'alert',
    category: 'glucose',
    message: 'Glucose levels higher than average this week.',
    priority: 3
  }
];

function TestComponent() {
  return <HealthInsights insights={mockInsights} loading={false} />;
}
```

---

## 🧪 Testing States

### Loading State
```javascript
<HealthInsights insights={[]} loading={true} />
```

### Empty State
```javascript
<HealthInsights insights={[]} loading={false} />
```

### Error State (Fallback)
```javascript
const fallbackInsight = [
  {
    type: 'neutral',
    category: 'general',
    message: 'Keep logging data to unlock insights!',
    priority: 1
  }
];

<HealthInsights insights={fallbackInsight} loading={false} />
```

---

## 🔧 Customization

### Change Gradients

Edit `getGradientColors()` function:

```javascript
const getGradientColors = (type) => {
  const gradients = {
    positive: 'from-emerald-500 via-teal-500 to-cyan-500',
    // Add your custom gradients here
    custom: 'from-yellow-400 via-orange-500 to-red-500',
  };
  return gradients[type] || gradients.neutral;
};
```

### Add New Icons

Edit `getIcon()` function:

```javascript
import { CustomIcon } from 'lucide-react';

const getIcon = (type) => {
  const iconMap = {
    positive: TrendingUp,
    custom: CustomIcon,  // Add new icon
  };
  return iconMap[type] || Heart;
};
```

### Modify Animations

Adjust animation parameters:

```javascript
transition={{
  delay: index * 0.15,  // Slower stagger
  duration: 0.6,        // Longer animation
  type: 'spring',
  stiffness: 120        // Bouncier
}}
```

---

## ⚡ Performance

### Optimizations

1. **AnimatePresence**: Efficient enter/exit animations
2. **Memoization**: Icons and gradients are memoized
3. **Lazy Loading**: Component loads on demand
4. **Tailwind JIT**: Only used classes are compiled

### Bundle Size

- Component: ~3 KB (minified)
- Dependencies: Framer Motion (~30 KB), Lucide icons (~2 KB)

---

## 🐛 Troubleshooting

### Insights not displaying

**Check:**
1. Is `insights` array populated?
2. Is `loading` set to `false`?
3. Does each insight have required fields (`type`, `message`)?

```javascript
console.log('Insights:', insights);
console.log('Loading:', loading);
```

### Gradients not showing

**Check:**
1. Tailwind CSS is properly configured
2. Gradient classes are in `safelist` if using JIT
3. Dark mode variant is working

### Animations not smooth

**Check:**
1. Framer Motion is installed: `npm install framer-motion`
2. No CSS conflicts with `transform` or `transition`
3. GPU acceleration enabled (automatic in most browsers)

---

## 📚 Related Documentation

- [Health Data Fetcher](./HEALTH_DATA_FETCHER_DOCS.md)
- [Health Insights Generator](./HEALTH_INSIGHTS_GENERATOR_DOCS.md)
- [AI Insights Feature](./AI_INSIGHTS_FEATURE.md)

---

## 🎓 Best Practices

### ✅ Do

- Use `HealthInsightsContainer` for automatic data fetching
- Pass insights as props for testing
- Show loading skeleton during fetch
- Handle empty states gracefully
- Use semantic insight types

### ❌ Don't

- Fetch data inside the component (use container)
- Hardcode colors (use type-based gradients)
- Skip loading states
- Ignore error handling
- Mix data fetching with presentation

---

## 🚀 Quick Start

**1. Install dependencies:**
```bash
npm install framer-motion lucide-react
```

**2. Import container:**
```javascript
import HealthInsightsContainer from '@/components/HealthInsightsContainer';
```

**3. Add to dashboard:**
```javascript
function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div>
      <HealthInsightsContainer userId={user.uid} />
    </div>
  );
}
```

**4. View insights:**
Navigate to `/dashboard` and see AI-generated insights!

---

## 📞 Support

For issues or questions:
1. Check [examples](./HealthInsights.examples.js)
2. Review [troubleshooting](#-troubleshooting)
3. See [related docs](#-related-documentation)

---

**Built with ❤️ using React, Framer Motion, and Tailwind CSS**
