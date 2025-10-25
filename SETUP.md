# MediMate - Setup Instructions

## Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication (Email/Password & Google)
3. Create Firestore Database
4. Enable Storage
5. Get your Firebase config from Project Settings

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### 4. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select your project)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 6. Try Demo Mode

Visit http://localhost:3000/login?demo=true and click "Launch Demo" to see the app with sample data!

## Deploy to Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Features Implemented

✅ Authentication (Email/Password, Google OAuth)
✅ Dashboard with real-time data
✅ Health metrics logging (Weight, BP, Steps, Glucose, HR)
✅ Medication management with schedules
✅ AI Symptom Checker (Gemini)
✅ Dark mode with beautiful UI
✅ Data export (CSV)
✅ Responsive design
✅ Demo mode with sample data
✅ Profile & settings management
✅ Firestore security rules
✅ Cloud Functions for email reminders

## Tech Stack

- Next.js 16
- Firebase (Auth, Firestore, Storage, Functions)
- Tailwind CSS
- Framer Motion
- Chart.js
- Lucide Icons
- Google Gemini AI

Enjoy using MediMate! 🏥
