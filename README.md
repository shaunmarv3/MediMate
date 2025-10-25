# MediMate - Personal Health Tracker & Medication Manager

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4"/>
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
</div>

## 🏥 Overview

MediMate is a comprehensive, AI-powered personal health tracking and medication management web application. Track your health metrics, manage medications with smart reminders, get **personalized** AI-powered symptom guidance that considers your medication and health data, and visualize your wellness journey—all in one secure, user-friendly platform.

### ✨ Key Features

- 🔐 **Secure Authentication** - Email/password and Google OAuth sign-in with Firebase Auth
- 💊 **Smart Medication Management** - Track medications with scheduling, push notifications, and email reminders
- 📊 **Health Metrics Tracking** - Log and visualize weight, blood pressure, steps, glucose, heart rate, oxygen levels, and sleep
- 🤖 **Personalized AI Symptom Checker** - Get intelligent symptom guidance powered by **Google Gemini AI 2.5 Flash** that considers your current medications and health metrics
- � **Browser Push Notifications** - Real-time medication reminders with Firebase Cloud Messaging
- � **Email Notifications** - Medication reminders sent to your email
- 📈 **Beautiful Analytics** - Interactive charts and trend visualization with Chart.js
- 🌙 **Dark Mode** - Stunning UI with full dark mode support
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🔒 **Privacy-First** - Your health data is encrypted and belongs only to you
- ⚡ **Real-time Updates** - Instant data synchronization across all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Firebase project ([Create one here](https://console.firebase.google.com/))
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Firebase VAPID key for push notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adithyasn11/ideathon.git
   cd ideathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   Key dependencies:
   - `next@16` - React framework with App Router
   - `firebase@11` - Firebase SDK
   - `react-firebase-hooks` - React hooks for Firebase
   - `@google/generative-ai` - Gemini AI SDK (or direct API calls)
   - `framer-motion` - Animations
   - `chart.js` & `react-chartjs-2` - Charts
   - `sonner` - Toast notifications
   - `lucide-react` - Icons

3. **Set up environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Firebase Cloud Messaging (for push notifications)
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
   
   # Google Gemini AI
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Firebase**

   a. **Enable Authentication:**
   - Go to Firebase Console → Authentication → Get Started
   - Enable **Email/Password** provider
   - Enable **Google** provider
   
   b. **Set up Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in **production mode**
   - Choose your preferred region
   - Deploy security rules from `firestore.rules`
   
   **Firestore Data Structure:**
   ```
   users/
     {userId}/
       medications/
         {medicationId}/
           name, dosage, schedule, instructions, startDate, endDate, createdAt
       metrics/
         {metricId}/
           type, value, timestamp, note
   ```

   c. **Set up Firebase Storage:**
   - Go to Storage → Get Started
   - Start in **production mode**
   - Deploy storage rules from `storage.rules`

   d. **Enable Firebase Cloud Messaging (Push Notifications):**
   - Go to Project Settings → Cloud Messaging
   - Under "Web configuration" → Generate Web Push certificates
   - Copy the **VAPID key** to your `.env.local` as `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
   - Update `public/firebase-messaging-sw.js` with your Firebase config

   e. **Add Service Worker:**
   - The service worker (`firebase-messaging-sw.js`) is already configured in `/public`
   - It handles background push notifications
   - Make sure to update Firebase config in this file

5. **Configure Notification Icons:**
   - The app uses dynamic favicon generation with Next.js
   - Heart emoji icon is auto-generated via `src/app/icon.js`
   - For custom icons, replace these files with your design

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
medimate/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard with health overview
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page
│   │   ├── forgot-password/    # Password reset
│   │   ├── medications/        # Medication management with notifications
│   │   ├── metrics/            # Health metrics tracking
│   │   ├── symptoms/           # AI symptom checker (Gemini AI)
│   │   ├── profile/            # User profile management
│   │   ├── settings/           # App settings
│   │   ├── help/               # Help and FAQs
│   │   ├── layout.js           # Root layout with fonts and providers
│   │   ├── page.js             # Landing page
│   │   ├── icon.js             # Dynamic favicon generation
│   │   ├── apple-icon.js       # Apple touch icon
│   │   └── globals.css         # Global styles with Tailwind v4
│   ├── components/
│   │   ├── AuthProvider.js     # Firebase Authentication context
│   │   ├── ThemeProvider.js    # Dark/light mode context
│   │   ├── ProtectedRoute.js   # Route protection HOC
│   │   └── DashboardNav.js     # Navigation with notification bell
│   └── lib/
│       ├── firebase.js         # Firebase configuration
│       ├── notifications.js    # Notification utilities
│       └── demoData.js         # Demo/seed data
├── functions/                  # Firebase Cloud Functions (optional)
│   ├── index.js               # Email notification function
│   └── package.json
├── public/
│   ├── firebase-messaging-sw.js # Service worker for push notifications
│   └── manifest.json          # PWA manifest
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
├── storage.rules              # Firebase Storage security rules
├── firebase.json              # Firebase configuration
├── tailwind.config.js         # Tailwind CSS v4 configuration
├── next.config.mjs            # Next.js configuration
├── eslint.config.mjs          # ESLint configuration
├── .env.local                 # Environment variables (gitignored)
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🎨 Design System

### Color Palette

MediMate uses a carefully crafted medical-grade color palette:

- **Primary (Teal):** `#06b6d4` - Trust, healthcare, technology
- **Secondary (Purple):** `#7c3aed` - Innovation, wellness
- **Success (Green):** `#22c55e` - Healthy, positive outcomes
- **Warning (Amber):** `#eab308` - Attention, reminders
- **Danger (Red):** `#ef4444` - Alerts, critical information

### Typography

- **Display Font:** Poppins (headings)
- **Body Font:** Inter (content)

### Dark Mode

Toggle between light and dark themes with the theme switcher in the navigation. Preferences are saved to localStorage.

## 🔒 Security & Privacy

### Data Protection

- All user data is stored in Firebase Firestore with strict security rules
- Each user can only access their own data (enforced at database level)
- Authentication is required for all sensitive operations
- Images are stored in Firebase Storage with user-specific access controls

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### Medical Disclaimer

⚠️ **IMPORTANT MEDICAL DISCLAIMER:** 

MediMate is an informational health tracking and wellness tool, **NOT a medical device or substitute for professional medical advice, diagnosis, or treatment.** 

- The AI symptom checker provides general information only
- Always consult qualified healthcare professionals for medical decisions
- In case of medical emergency, call emergency services immediately
- Do not rely solely on this app for medication management
- Always follow your doctor's instructions regarding medications

This application is for educational and tracking purposes only.

---

## 🎯 Project Highlights

### What Makes MediMate Special:

1. **🧠 Personalized AI** - First symptom checker that considers YOUR medications and health data
2. **⚡ Real-Time Everything** - Firestore listeners keep data synced instantly
3. **🎨 Beautiful UI** - Medical-grade design with professional dark mode
4. **🔔 Smart Notifications** - Browser push + notification bell + email reminders
5. **📱 Mobile-First** - Responsive design that works everywhere
6. **🔒 Secure** - Firebase security rules protect your health data
7. **💪 Production-Ready** - Deployed on Vercel with zero configuration

### Recent Updates:

- ✅ Upgraded to Next.js 16 and React 19
- ✅ Integrated Gemini 2.5 Flash for faster AI responses
- ✅ Added personalized symptom analysis with health data
- ✅ Implemented medication end dates with auto-deletion
- ✅ Added delete functionality for medications
- ✅ Fixed time display to 12-hour format (AM/PM)
- ✅ Added notification bell with upcoming doses
- ✅ Improved header layout and responsive design
- ✅ Created dynamic favicon with heart icon
- ✅ Optimized AI prompts for complete responses (4096 tokens)

---

## 🧪 Testing the App

### Test Personalized AI Feature:

1. **Add a medication:**
   - Go to Medications page
   - Add "Lisinopril 10mg" taken daily at 8:00 AM

2. **Add health metrics:**
   - Go to Metrics page
   - Add your weight (e.g., 76 kg)
   - Add heart rate, steps, etc.

3. **Test AI Symptom Checker:**
   - Go to Symptoms page
   - You'll see "Personalized Analysis Enabled" badge
   - Describe symptoms like "I have a headache and breathing problems"
   - AI will consider your Lisinopril medication and provide personalized advice!

4. **Test Notifications:**
   - Add a medication with time 2 minutes from now
   - Grant notification permission
   - Wait for notification to appear
   - Click notification bell to see upcoming doses

---

## 📱 Features Deep Dive

### 1. Smart Medication Management 💊

**Features:**
- Add medications with name, dosage, schedule, and custom instructions
- Set medication start and end dates (auto-deletion after expiry)
- Multiple daily schedules (e.g., 8:00 AM, 2:00 PM, 8:00 PM)
- Delete medications with confirmation
- **Browser Push Notifications** - Alerts when it's time to take medication (requires browser to be open)
- **Notification Bell** - Shows upcoming doses for the day in a dropdown
- **12-hour time format** with AM/PM display

**How Notifications Work:**
- Uses Firebase Cloud Messaging (FCM)
- **Option C Implementation**: Browser-based notifications (works when app is open)
- Real-time notification bell with upcoming medication schedule
- Permission requested on medication submission
- Stored in localStorage for persistence

**Technical Details:**
- Firestore path: `users/{userId}/medications/{medicationId}`
- Service worker: `public/firebase-messaging-sw.js`
- Notification utility: `src/lib/notifications.js`

### 2. Health Metrics Tracking 📊

**Supported Metrics:**
- **Weight** - Track in kg with decimal precision
- **Blood Pressure** - Systolic/diastolic readings
- **Heart Rate** - BPM
- **Steps** - Daily step count
- **Blood Sugar/Glucose** - mg/dL readings
- **Oxygen Level** - SpO2 percentage
- **Sleep Hours** - Track sleep duration

**Features:**
- Add notes to each metric entry
- Timestamp tracking with proper date formatting
- Real-time updates across devices
- Beautiful data visualization

**Technical Details:**
- Firestore path: `users/{userId}/metrics/{metricId}`
- Each metric stored as individual document with `type` and `value` fields
- Timestamp field for chronological tracking

### 3. Personalized AI Symptom Checker 🤖

**Revolutionary Personalization:**
- **Automatically fetches** your current medications and latest health metrics
- **AI considers** your health profile when providing guidance
- Shows "Personalized" badge when using your data
- Falls back to general advice if no health data exists

**What It Analyzes:**
1. **Your Symptoms** - Detailed description of what you're experiencing
2. **Current Medications** - Checks for possible side effects and interactions
3. **Health Metrics** - Considers your weight, heart rate, blood pressure, etc.

**AI Response Includes:**
1. Symptom Analysis (personalized to your health profile)
2. Possible Causes (considering your medications)
3. Medication Considerations (side effects/interactions)
4. Food Recommendations (what to eat and avoid)
5. Self-Care Tips (tailored to your health data)
6. When to Seek Medical Attention

**Technical Details:**
- Powered by **Google Gemini 2.5 Flash**
- Token limit: 4096 (handles complete responses)
- Prompt optimization for personalization
- Markdown cleanup for beautiful formatting
- Real-time health data integration

**Example:**
If you're taking Lisinopril (blood pressure medication) and report headaches:
- AI checks if headaches are a side effect of Lisinopril
- Considers your weight and blood pressure readings
- Provides medication-specific guidance
- Recommends foods that work with your medication

### 4. Real-Time Notifications 🔔

**Notification Bell:**
- Shows count of upcoming medication doses
- Dropdown displays today's schedule with times (AM/PM format)
- Real-time updates using Firestore listeners
- Sleek animation with Framer Motion

**Push Notifications:**
- Browser notifications when medication time arrives
- Works when browser tab is open (Option C limitation)
- Click notification to return to app
- Vibration support on mobile devices

### 5. Beautiful Analytics Dashboard 📈

- Health metrics visualization with Chart.js
- Interactive line charts with hover tooltips
- Date range filtering
- Responsive design for all screen sizes

## 🚢 Deployment

### Deploy to Vercel (Recommended) ⚡

Vercel is the easiest way to deploy your Next.js app with zero configuration.

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click **"New Project"**
   - Import your `ideathon` repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables:**
   In Vercel project settings → Environment Variables, add ALL variables from your `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_VAPID_KEY
   NEXT_PUBLIC_GEMINI_API_KEY
   NEXT_PUBLIC_APP_URL (set to your Vercel domain)
   ```

4. **Deploy:**
   - Click **"Deploy"**
   - Vercel will build and deploy your app automatically
   - You'll get a production URL like `https://your-app.vercel.app`

5. **Update Firebase Configuration:**
   - Go to Firebase Console → Authentication → Settings
   - Add your Vercel domain to **Authorized domains**
   - Update `NEXT_PUBLIC_APP_URL` in Vercel env variables to your production URL

6. **Update Service Worker:**
   - The service worker already has Firebase config hardcoded
   - If you want to use env variables, you'll need to dynamically inject them

### Deploy to Firebase Hosting (Alternative)

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase:**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `out`
   - Configure as single-page app: Yes
   - Don't overwrite files

3. **Update next.config.mjs for static export:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   
   export default nextConfig;
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

**Note:** Static export has limitations:
- No Server Components (all must be client components)
- No API routes
- No dynamic routing with SSR
- **Recommended: Use Vercel for full Next.js support**

### Deploy Firebase Functions (Optional)

For email reminders:

```bash
cd functions
npm install
firebase deploy --only functions
```

Configure email credentials:
```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint to check code quality

### Project Configuration Files

- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS v4 configuration with custom colors
- `eslint.config.mjs` - ESLint rules
- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore composite indexes
- `storage.rules` - Firebase Storage security rules

### Adding New Features

1. **Create feature components** in `src/components/`
2. **Add pages** in `src/app/` following App Router structure
3. **Update navigation** in `src/components/DashboardNav.js`
4. **Add Firestore collections** as needed under `users/{userId}/`
5. **Update security rules** in `firestore.rules` to allow access
6. **Test thoroughly** with real Firebase data

### Common Development Tasks

**Add a new health metric type:**
1. Update Metrics page form to include new metric type
2. Add visualization in Dashboard
3. Update AI prompt in Symptoms page to consider new metric

**Add a new notification type:**
1. Update `src/lib/notifications.js` with new notification function
2. Add trigger logic in relevant page
3. Test with FCM

**Customize AI responses:**
1. Edit prompt in `src/app/symptoms/page.js`
2. Adjust `maxOutputTokens` if needed
3. Update formatting cleanup functions

---

## 🤝 Contributing

Contributions are welcome! This is an open-source ideathon project.

### How to Contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style:

- Use ESLint rules defined in `eslint.config.mjs`
- Follow React 19 and Next.js 16 best practices
- Use Tailwind CSS for styling (no inline styles)
- Write clear commit messages
- Test before submitting PR

---

## 📄 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Firebase** - Backend infrastructure and real-time database
- **Google Gemini** - AI capabilities for symptom analysis
- **Vercel** - Seamless deployment platform
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icon library
- **Chart.js** - Data visualization
- **Framer Motion** - Smooth animations

---

## 📧 Contact & Support

- **GitHub:** [adithyasn11/ideathon](https://github.com/adithyasn11/ideathon)
- **Issues:** [Report a bug](https://github.com/adithyasn11/ideathon/issues)
- **Discussions:** Use GitHub Discussions for questions

---

<div align="center">
  <p><strong>Made with ❤️ for better health management</strong></p>
  <p>Built with Next.js 16 • Firebase • Gemini AI</p>
  <p>⚕️ <strong>Medical Disclaimer:</strong> This app is for informational purposes only.</p>
  <p><em>Not a substitute for professional medical advice, diagnosis, or treatment.</em></p>
</div>

