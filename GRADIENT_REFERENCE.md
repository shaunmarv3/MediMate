# 🎨 HealthInsights Gradient Reference

## Visual Color Guide

### 1. Positive Gradient (Emerald → Teal → Cyan)
```
Type: 'positive'
Tailwind: from-emerald-500 via-teal-500 to-cyan-500
Use Case: Good progress, health improvements, positive trends
```
🟢🔵 **Example:** "Your blood pressure has improved by 5% this week!"

---

### 2. Alert Gradient (Rose → Pink → Red)
```
Type: 'alert'
Tailwind: from-rose-500 via-pink-500 to-red-500
Use Case: Warnings, concerning trends, action needed
```
🔴 **Example:** "Your glucose levels are trending higher than normal."

---

### 3. Neutral Gradient (Slate → Gray → Zinc)
```
Type: 'neutral'
Tailwind: from-slate-500 via-gray-500 to-zinc-500
Use Case: General information, stable metrics, tips
```
⚪ **Example:** "Your health metrics are stable overall."

---

### 4. Achievement Gradient (Purple → Fuchsia → Pink)
```
Type: 'achievement'
Tailwind: from-purple-500 via-fuchsia-500 to-pink-500
Use Case: Milestones, achievements, streaks, celebrations
```
💜💗 **Example:** "🎉 Perfect medication adherence for 30 days straight!"

---

### 5. Improvement Gradient (Blue → Indigo → Violet)
```
Type: 'improvement'
Tailwind: from-blue-500 via-indigo-500 to-violet-500
Use Case: Behavioral improvements, positive habit formation
```
🔵💜 **Example:** "Sleep quality improved by 15% - keep up that bedtime routine!"

---

## Icon Mapping

| Type | Icon | Lucide Component |
|------|------|------------------|
| `positive` | ↗️ | `TrendingUp` |
| `alert` | ⚠️ | `AlertCircle` |
| `neutral` | 🧠 | `Brain` |
| `achievement` | 🏆 | `Award` |
| `improvement` | 📈 | `Activity` |
| Default | ❤️ | `Heart` |

---

## Complete Card Structure

```
┌─────────────────────────────────────────────────────┐
│  [GRADIENT BACKGROUND - type-based color]           │
│                                                      │
│  ┌──────┐  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│  │ ICON │  Insight Message (white text)             │
│  │ (BG) │  Lorem ipsum dolor sit amet...            │
│  └──────┘                                            │
│            ┌──────────────┐                          │
│            │ CATEGORY TAG │                          │
│            └──────────────┘                          │
└─────────────────────────────────────────────────────┘
```

---

## Usage Examples

### Example 1: Positive Insight
```javascript
{
  type: 'positive',
  category: 'blood_pressure',
  message: 'Great job! Your systolic blood pressure dropped from 135 to 122 mmHg this week.',
  priority: 2
}
```
**Result:** Green gradient card with trending-up icon

---

### Example 2: Achievement Insight
```javascript
{
  type: 'achievement',
  category: 'adherence',
  message: '🎉 Incredible! 100% medication adherence for an entire month!',
  priority: 1
}
```
**Result:** Purple-pink gradient card with award icon

---

### Example 3: Alert Insight
```javascript
{
  type: 'alert',
  category: 'glucose',
  message: 'Your average glucose is 145 mg/dL (target: 120 mg/dL). Review your carb intake.',
  priority: 3
}
```
**Result:** Red gradient card with alert icon

---

### Example 4: Improvement Insight
```javascript
{
  type: 'improvement',
  category: 'activity',
  message: 'You're walking 2,000 more steps per day this week - excellent habit building!',
  priority: 2
}
```
**Result:** Blue-violet gradient card with activity icon

---

### Example 5: Neutral Insight
```javascript
{
  type: 'neutral',
  category: 'overall',
  message: 'All vitals stable. Continue regular monitoring for ongoing health tracking.',
  priority: 4
}
```
**Result:** Gray gradient card with brain icon

---

## Animation Sequence

```
Time 0.0s:   Container fades in (opacity 0 → 1)
Time 0.1s:   Card 1 slides in from left
Time 0.2s:   Card 2 slides in from left
Time 0.3s:   Card 3 slides in from left
Time 0.4s:   Card 4 slides in from left
Time 0.5s:   Card 5 slides in from left
Time 0.5s:   Footer note fades in
```

**Total duration:** ~0.9 seconds for full cascade

---

## Hover Effects

```
Default:     scale(1.0)   shadow-lg
Hover:       scale(1.02)  shadow-xl
Transition:  0.2s ease
```

---

## Category Tags

Categories are displayed as badges:

```
┌──────────────────┐
│ BLOOD PRESSURE   │  ← Uppercase, white text, semi-transparent background
└──────────────────┘
```

Common categories:
- `blood_pressure` → BLOOD PRESSURE
- `glucose` → GLUCOSE
- `adherence` → ADHERENCE
- `weight` → WEIGHT
- `sleep` → SLEEP
- `activity` → ACTIVITY
- `overall` → OVERALL

---

## Dark Mode Adjustments

All gradients maintain vibrancy in dark mode:
- Background: Dark slate (bg-slate-900)
- Text: Automatic contrast
- Shadows: Enhanced for visibility
- Icons: White (100% opacity)

---

## Accessibility

- ✅ High contrast text (white on gradient)
- ✅ Large touch targets (minimum 44x44px)
- ✅ Semantic HTML structure
- ✅ Icon + text for screen readers
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed

---

## Quick Reference Table

| Type | Gradient Colors | Icon | Example Use |
|------|----------------|------|-------------|
| `positive` | 🟢 Emerald-Teal-Cyan | ↗️ | BP improved |
| `alert` | 🔴 Rose-Pink-Red | ⚠️ | Glucose high |
| `neutral` | ⚪ Slate-Gray-Zinc | 🧠 | Metrics stable |
| `achievement` | 💜 Purple-Pink | 🏆 | Adherence streak |
| `improvement` | 🔵 Blue-Violet | 📈 | Better sleep |

---

**Built with Tailwind CSS v4 + Framer Motion**
