# MediMate - Personal Health Tracker & Medication Manager

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</div>

## 🏥 Overview

MediMate is a comprehensive, beautifully designed personal health tracking and medication management web application. Track your health metrics, manage medications with smart reminders, get AI-powered symptom guidance, and visualize your wellness journey—all in one secure, user-friendly platform.

### ✨ Key Features

- 🔐 **Secure Authentication** - Email/password and Google OAuth sign-in
- 💊 **Medication Management** - Track medications with smart reminders and adherence analytics
- 📊 **Health Metrics** - Log and visualize weight, blood pressure, steps, glucose, heart rate, and more
- 🤖 **AI Symptom Checker** - Get intelligent symptom guidance powered by Google Gemini AI
- 📈 **Beautiful Analytics** - Interactive charts and trend visualization
- 🔔 **Smart Reminders** - Browser push notifications and email reminders
- 🌙 **Dark Mode** - Beautiful, professional UI with full dark mode support
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🔒 **Privacy-First** - Your health data is encrypted and belongs only to you
- 📤 **Data Export** - Export your health data as CSV anytime

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Firebase project ([Create one here](https://console.firebase.google.com/))
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medimate.git
   cd medimate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Firebase and Gemini credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Firebase**

   a. **Enable Authentication:**
   - Go to Firebase Console → Authentication
   - Enable Email/Password and Google sign-in methods

   b. **Set up Firestore:**
   - Go to Firestore Database → Create database (start in production mode)
   - Deploy security rules from `firestore.rules`:
     ```bash
     firebase deploy --only firestore:rules
     ```

   c. **Set up Storage:**
   - Go to Storage → Get Started
   - Deploy storage rules from `storage.rules`:
     ```bash
     firebase deploy --only storage
     ```

   d. **Enable Cloud Messaging (for push notifications):**
   - Go to Project Settings → Cloud Messaging
   - Generate a Web Push certificate
   - Add the public key to your Firebase config

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Demo Mode

Try MediMate instantly with pre-populated sample data:

1. Go to [http://localhost:3000/login?demo=true](http://localhost:3000/login?demo=true)
2. Click "Launch Demo"
3. Explore the full functionality with sample medications and health metrics!

Demo credentials (if needed manually):
- **Email:** demo@medimate.test
- **Password:** demo123456

## 📁 Project Structure

```
medimate/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Authentication pages
│   │   ├── signup/
│   │   ├── medications/        # Medication management
│   │   ├── metrics/            # Health metrics tracking
│   │   ├── symptoms/           # AI symptom checker
│   │   ├── profile/            # User profile
│   │   ├── settings/           # App settings
│   │   ├── help/               # Help and documentation
│   │   ├── layout.js           # Root layout with fonts
│   │   ├── page.js             # Landing page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── AuthProvider.js     # Authentication context
│   │   ├── ThemeProvider.js    # Dark mode context
│   │   ├── ProtectedRoute.js   # Route protection
│   │   └── DashboardNav.js     # Dashboard navigation
│   └── lib/
│       ├── firebase.js         # Firebase configuration
│       └── demoData.js         # Demo user generator
├── functions/                  # Cloud Functions (optional)
├── public/                     # Static assets
├── firestore.rules            # Firestore security rules
├── storage.rules              # Storage security rules
├── tailwind.config.js         # Tailwind configuration
├── .env.local                 # Environment variables (gitignored)
├── .env.local.example         # Environment template
├── package.json
└── README.md
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

⚠️ **Important:** MediMate is an informational and tracking tool, NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions.

## 📱 Features Deep Dive

### 1. Medication Management

- Add medications with name, dosage, schedule, and instructions
- Upload medication photos
- Set custom reminder schedules (multiple times per day)
- Track adherence with dose logging
- View adherence analytics and streaks
- Browser push notifications and email reminders

### 2. Health Metrics Tracking

Supported metrics:
- **Weight:** Track in kg or lbs
- **Blood Pressure:** Systolic/diastolic readings
- **Steps:** Daily step count
- **Blood Glucose:** mg/dL or mmol/L
- **Heart Rate:** BPM
- Upload supporting images (receipts, screenshots)
- Add notes to each entry

### 3. AI Symptom Checker

- Multi-step guided symptom assessment
- Powered by Google Gemini AI
- Provides:
  - Symptom descriptions
  - Self-care recommendations
  - Red flags requiring immediate attention
  - Medical disclaimers

### 4. Analytics & Insights

- Interactive line charts for metric trends
- Filter by date range (7d/30d/90d/custom)
- Adherence rate calculation
- Streak tracking
- Real-time data updates

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Add environment variables from `.env.local`
   - Deploy!

3. **Update Firebase config:**
   - Add your Vercel domain to Firebase Authentication → Authorized domains

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

### Test Demo User Creation
```bash
npm run seed-demo
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build locally
- `npm run lint` - Run ESLint

### Adding New Features

1. Create feature components in `src/components/`
2. Add pages in `src/app/`
3. Update navigation in `src/components/DashboardNav.js`
4. Add Firestore collections as needed
5. Update security rules in `firestore.rules`

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Chart.js & react-chartjs-2
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Notifications:** Sonner (toast) + FCM (push)
- **AI:** Google Gemini API
- **Dates:** date-fns

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- UI inspiration from modern healthcare applications
- Firebase for backend infrastructure
- Google Gemini for AI capabilities

## 📧 Contact & Support

- **Email:** support@medimate.app
- **Issues:** [GitHub Issues](https://github.com/yourusername/medimate/issues)
- **Documentation:** [MediMate Docs](https://medimate.app/help)

---

<div align="center">
  <p>Made with ❤️ for better health management</p>
  <p><strong>⚕️ Disclaimer:</strong> MediMate is not a substitute for professional medical advice.</p>
</div>

