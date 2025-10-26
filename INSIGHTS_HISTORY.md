# 📜 AI Insights History System

## Overview

Scrollable history sidebar showing past AI health summaries with weekly snapshots stored in Firestore.

---

## 🎯 Features

✅ **Weekly Snapshots** - Automatic weekly health summary archives  
✅ **Scrollable Sidebar** - View past 12 weeks of insights  
✅ **Type Breakdown** - Visual count of positive/alert/achievement insights  
✅ **Key Phrases** - Preview snippets of each insight  
✅ **Detail View** - Expand any week to see full insights  
✅ **Generation Dates** - See when each summary was created  
✅ **Automatic Archiving** - Snapshots saved on first generation each week  

---

## 📊 Architecture

### Firestore Structure

```
aiInsightsHistory/
  {userId}/
    snapshots/
      2025-W43/
        weekId: "2025-W43"
        userId: "abc123"
        timestamp: Timestamp
        week: 43
        year: 2025
        insightsCount: 5
        typeCounts: {
          positive: 2,
          alert: 1,
          achievement: 1,
          neutral: 1
        }
        insights: [
          {
            type: "positive",
            category: "blood_pressure",
            snippet: "Your blood pressure has improved by 5%...",
            priority: 1
          }
        ]
        fullInsights: [
          {
            type: "positive",
            category: "blood_pressure",
            message: "Your blood pressure has improved by 5% this week!",
            priority: 1
          }
        ]
        generatedAt: "2025-10-26T10:30:00Z"
      
      2025-W42/
        ... (previous week)
```

---

## 📁 Files Created

### 1. `src/lib/insightsHistory.js` (250 lines)

**Functions:**

| Function | Purpose |
|----------|---------|
| `saveInsightsSnapshot(userId, insights)` | Save weekly snapshot |
| `getInsightsHistory(userId, limit)` | Get past N weeks |
| `getSnapshot(userId, weekId)` | Get specific week |
| `shouldCreateSnapshot(userId)` | Check if snapshot needed |
| `formatWeekId(weekId)` | Format "2025-W43" → "Week 43, 2025" |
| `getWeekDateRange(weekId)` | Get start/end dates for week |

---

### 2. `src/components/InsightsHistorySidebar.js` (370 lines)

**React Component:**

- Scrollable sidebar (full height, 384px width on desktop)
- Animated entrance (slide from right)
- Weekly snapshot cards with:
  - Week number and date range
  - Type counts (colored badges)
  - Key phrase previews (first 2 insights)
  - Total insights count
- Detail view modal
- Empty state handling
- Loading skeletons

---

### 3. Updated `src/lib/insightsCache.js`

**Changes:**
- Auto-saves weekly snapshot when caching insights
- Checks if snapshot already exists for current week
- Only creates one snapshot per week

---

### 4. Updated `src/components/HealthInsights.js`

**Changes:**
- Added `History` icon import
- Added `onOpenHistory` prop
- History button in header next to refresh button

---

### 5. Updated `src/app/dashboard/page.js`

**Changes:**
- Added `InsightsHistorySidebar` component
- Added `historySidebarOpen` state
- Passed `onOpenHistory` handler to HealthInsights

---

## 🎨 UI/UX Flow

### Opening History

```
User clicks History icon [📜]
    ↓
Sidebar slides in from right
    ↓
Loads last 12 weeks from Firestore
    ↓
Displays snapshot cards (newest first)
```

### Viewing Detail

```
User clicks snapshot card
    ↓
Detail modal slides over sidebar
    ↓
Shows full insights with gradient cards
    ↓
User clicks X to return to list
```

### Closing Sidebar

```
User clicks backdrop or X button
    ↓
Sidebar slides out to right
    ↓
Returns to dashboard
```

---

## 📊 Snapshot Card Layout

```
┌────────────────────────────────────┐
│ 📅 Week 43, 2025        [Latest]   │
│ Oct 20 - Oct 26, 2025              │
│                                     │
│ [✓ 2] [⚠ 1] [🏆 1] [🧠 1]         │ ← Type counts
│                                     │
│ blood_pressure: Your blood         │
│ pressure has improved by 5%...     │ ← Key phrases
│                                     │
│ glucose: Glucose levels stable...  │
│                                     │
│ +1 more insights                   │
│ ─────────────────────────────────  │
│ 5 total insights                   │
└────────────────────────────────────┘
```

---

## 🔄 Automatic Snapshot Logic

### When Snapshot is Created

```javascript
// In insightsCache.js → saveToCache()

if (insights generated successfully) {
  ├─ Save to cache (aiInsights/{userId})
  └─ Check if snapshot needed for current week
      ├─ Get current week ID (e.g., "2025-W43")
      ├─ Check if snapshot exists
      └─ If NO → Create snapshot
          └─ Save to aiInsightsHistory/{userId}/snapshots/{weekId}
}
```

### Snapshot Frequency

- **One snapshot per week**
- Created on **first successful insight generation** of the week
- Subsequent generations same week → no new snapshot
- New week → new snapshot created

---

## 🧪 Testing

### Test Snapshot Creation

```javascript
import { saveInsightsSnapshot } from '@/lib/insightsHistory';

const insights = [
  { type: 'positive', category: 'bp', message: 'BP improved!', priority: 1 },
  { type: 'alert', category: 'glucose', message: 'Glucose high', priority: 2 }
];

await saveInsightsSnapshot('testUser', insights);

// Check Firestore:
// aiInsightsHistory/testUser/snapshots/2025-W43
```

### Test History Retrieval

```javascript
import { getInsightsHistory } from '@/lib/insightsHistory';

const history = await getInsightsHistory('testUser', 5);

console.log(history);
/*
[
  { weekId: '2025-W43', insightsCount: 5, ... },
  { weekId: '2025-W42', insightsCount: 4, ... },
  { weekId: '2025-W41', insightsCount: 3, ... }
]
*/
```

### Test Sidebar

```bash
npm run dev
```

1. Navigate to `/dashboard`
2. Click History icon (📜) in AI Insights section
3. Sidebar should slide in from right
4. Should show past weeks (if any exist)
5. Click a week card to view full details
6. Click X to close detail view
7. Click backdrop or X to close sidebar

---

## 📱 Responsive Design

| Screen Size | Behavior |
|-------------|----------|
| **Mobile** | Sidebar full width (100vw) |
| **Tablet** | Sidebar 384px (sm:w-96) |
| **Desktop** | Sidebar 384px, offset from left nav |

---

## 🎨 Visual Elements

### Type Icons & Colors

| Type | Icon | Color | Badge Background |
|------|------|-------|------------------|
| Positive | ↗️ | Emerald | Light emerald |
| Alert | ⚠️ | Rose | Light rose |
| Achievement | 🏆 | Purple | Light purple |
| Improvement | 📈 | Blue | Light blue |
| Neutral | 🧠 | Slate | Light slate |

### Animations

1. **Sidebar Entrance**: Slide from right (spring physics)
2. **Backdrop Fade**: Opacity 0 → 1
3. **Card Stagger**: Each card delays 0.05s
4. **Detail Modal**: Fade in over sidebar
5. **Hover**: Cards scale and shadow on hover

---

## 📊 Data Examples

### Snapshot Data

```javascript
{
  id: "2025-W43",
  weekId: "2025-W43",
  userId: "abc123",
  timestamp: Date(2025-10-26T10:30:00Z),
  week: 43,
  year: 2025,
  insightsCount: 5,
  typeCounts: {
    positive: 2,
    alert: 1,
    achievement: 1,
    improvement: 1
  },
  insights: [
    {
      type: "positive",
      category: "blood_pressure",
      snippet: "Your blood pressure has improved by 5% this week...",
      priority: 1
    }
  ],
  fullInsights: [
    {
      type: "positive",
      category: "blood_pressure",
      message: "Your blood pressure has improved by 5% this week! Keep up the great work.",
      priority: 1
    }
  ],
  generatedAt: "2025-10-26T10:30:00.000Z"
}
```

### History Array

```javascript
[
  {
    id: "2025-W43",
    weekId: "2025-W43",
    insightsCount: 5,
    typeCounts: { positive: 2, alert: 1, achievement: 1, improvement: 1 },
    timestamp: Date(...)
  },
  {
    id: "2025-W42",
    weekId: "2025-W42",
    insightsCount: 4,
    typeCounts: { positive: 3, neutral: 1 },
    timestamp: Date(...)
  }
]
```

---

## 🔒 Security

### Firestore Rules

Add to `firestore.rules`:

```javascript
match /aiInsightsHistory/{userId} {
  match /snapshots/{snapshotId} {
    // Users can only read/write their own history
    allow read, write: if request.auth.uid == userId;
  }
}
```

---

## ⚡ Performance

### Optimizations

1. **Limit Query**: Only fetch last 12 weeks
2. **Lazy Loading**: Sidebar content loads on open
3. **Efficient Queries**: Ordered by timestamp (indexed)
4. **Cached Rendering**: React memoization for cards

### Expected Load Times

| Operation | Time |
|-----------|------|
| Open sidebar | < 500ms |
| Load 12 weeks | 200-400ms |
| Render cards | < 100ms |
| View detail | Instant (already loaded) |

---

## 📈 Use Cases

### 1. Track Progress Over Time

User can see how insights change week to week:
- Week 1: "BP trending high"
- Week 2: "BP improving"
- Week 3: "BP in healthy range"

### 2. Review Past Concerns

User can go back to see what alerts they received:
- "Week 40: Glucose trending high"
- "Week 41: Glucose stabilized"

### 3. Celebrate Achievements

User can revisit milestone weeks:
- "Week 38: 30-day adherence streak!"
- "Week 42: Lost 5 lbs this month!"

### 4. Share with Doctor

User can show historical insights to healthcare provider:
- Open Week 39
- View full insights
- Screenshot or discuss patterns

---

## 🧩 Integration Points

### Dashboard Integration

```javascript
// Dashboard component
<HealthInsights 
  insights={insights}
  onOpenHistory={() => setHistorySidebarOpen(true)}
  ...
/>

<InsightsHistorySidebar
  userId={user.uid}
  isOpen={historySidebarOpen}
  onClose={() => setHistorySidebarOpen(false)}
/>
```

### Automatic Archiving

```javascript
// Happens automatically when caching insights
await saveToCache(userId, insights);
  ↓
Checks if snapshot needed for current week
  ↓
If needed, calls saveInsightsSnapshot()
  ↓
Snapshot saved to Firestore
```

---

## 🐛 Troubleshooting

### History sidebar empty

**Check:**
1. Are snapshots being created? (Check Firestore)
2. User has generated insights at least once this week?
3. Console for errors loading history
4. Firestore rules allow reading snapshots

### Snapshot not saving

**Check:**
1. `shouldCreateSnapshot()` returning true?
2. Current week ID format correct?
3. Firestore rules allow writing
4. Console for save errors

### Wrong week number

**Check:**
1. ISO week calculation is correct
2. Week starts Monday (ISO standard)
3. Year boundary handling (Week 1 can be in December)

---

## 🚀 Future Enhancements

- [ ] Export history as PDF
- [ ] Compare two weeks side-by-side
- [ ] Trend graphs across weeks
- [ ] Filter by insight type
- [ ] Search historical insights
- [ ] Email weekly summaries
- [ ] Share insights with caregivers

---

## ✅ Implementation Checklist

- [x] Created `insightsHistory.js` utility
- [x] Created `InsightsHistorySidebar` component
- [x] Updated caching system to auto-save snapshots
- [x] Added history button to HealthInsights
- [x] Integrated sidebar into dashboard
- [x] Added animations and transitions
- [x] Implemented detail view
- [x] Added loading and empty states
- [x] Responsive design
- [x] Type counting and display
- [x] Date range formatting
- [x] No compilation errors

---

**Result: Users can now view their health insights history with beautiful weekly snapshots! 📜✨**
