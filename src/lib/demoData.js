import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from './firebase';

// Demo user credentials
const DEMO_EMAIL = 'demo@medimate.test';
const DEMO_PASSWORD = 'demo123456';

export async function createDemoUser() {
  try {
    // Create demo user
    const userCredential = await createUserWithEmailAndPassword(auth, DEMO_EMAIL, DEMO_PASSWORD);
    const userId = userCredential.user.uid;

    // Create user profile
    await setDoc(doc(db, 'users', userId), {
      displayName: 'Demo User',
      email: DEMO_EMAIL,
      dob: '1990-01-15',
      units: 'metric',
      timezone: 'America/New_York',
      createdAt: new Date().toISOString(),
      notificationPrefs: {
        email: true,
        push: true,
      },
    });

    // Add sample metrics
    const metricsData = [
      // Weight data (last 30 days)
      ...Array.from({ length: 30 }, (_, i) => ({
        type: 'weight',
        value: 75 + Math.sin(i / 5) * 2 + (Math.random() - 0.5),
        timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        note: i % 7 === 0 ? 'Morning measurement' : '',
      })),
      // Blood pressure data
      ...Array.from({ length: 20 }, (_, i) => ({
        type: 'bp',
        value: {
          systolic: 120 + Math.floor(Math.random() * 10),
          diastolic: 80 + Math.floor(Math.random() * 8),
        },
        timestamp: new Date(Date.now() - (29 - i * 1.5) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      // Steps data
      ...Array.from({ length: 15 }, (_, i) => ({
        type: 'steps',
        value: 7000 + Math.floor(Math.random() * 5000),
        timestamp: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      // Blood glucose
      ...Array.from({ length: 10 }, (_, i) => ({
        type: 'glucose',
        value: 95 + Math.floor(Math.random() * 15),
        timestamp: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      // Heart rate
      ...Array.from({ length: 12 }, (_, i) => ({
        type: 'hr',
        value: 68 + Math.floor(Math.random() * 12),
        timestamp: new Date(Date.now() - (11 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
    ];

    for (const metric of metricsData) {
      await addDoc(collection(db, 'users', userId, 'metrics'), metric);
    }

    // Add sample medications
    const medications = [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        schedule: [{ time: '08:00', repeat: 'daily' }],
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: null,
        instructions: 'Take with water in the morning',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        schedule: [
          { time: '08:00', repeat: 'daily' },
          { time: '20:00', repeat: 'daily' },
        ],
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: null,
        instructions: 'Take with meals',
        createdAt: new Date().toISOString(),
      },
      {
        name: 'Vitamin D',
        dosage: '1000 IU',
        schedule: [{ time: '09:00', repeat: 'daily' }],
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: null,
        instructions: 'Take with breakfast',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const med of medications) {
      const medRef = await addDoc(collection(db, 'users', userId, 'medications'), med);
      
      // Add dose history (last 7 days)
      for (let i = 0; i < 7; i++) {
        for (const scheduleItem of med.schedule) {
          const doseDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const [hours, minutes] = scheduleItem.time.split(':');
          doseDate.setHours(parseInt(hours), parseInt(minutes), 0);
          
          await addDoc(collection(db, 'users', userId, 'medications', medRef.id, 'doses'), {
            scheduledTime: doseDate.toISOString(),
            taken: Math.random() > 0.15, // 85% adherence
            takenAt: Math.random() > 0.15 ? doseDate.toISOString() : null,
          });
        }
      }
    }

    return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
  } catch (error) {
    // If user already exists, just return credentials
    if (error.code === 'auth/email-already-in-use') {
      return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
    }
    throw error;
  }
}

// Sample symptom data (for reference)
export const symptomDatabase = {
  headache: {
    description: 'Pain or discomfort in the head, scalp, or neck',
    selfCare: [
      'Rest in a quiet, dark room',
      'Apply a cold compress to your forehead',
      'Stay hydrated',
      'Take over-the-counter pain relievers as directed',
    ],
    redFlags: [
      'Sudden, severe headache (worst of your life)',
      'Headache with fever, stiff neck, confusion, or vision changes',
      'Headache after head injury',
      'Progressive worsening over days/weeks',
    ],
  },
  fever: {
    description: 'Body temperature above 100.4°F (38°C)',
    selfCare: [
      'Drink plenty of fluids',
      'Rest',
      'Take acetaminophen or ibuprofen as directed',
      'Keep cool with light clothing',
    ],
    redFlags: [
      'Temperature above 103°F (39.4°C)',
      'Fever lasting more than 3 days',
      'Difficulty breathing',
      'Severe headache or stiff neck',
      'Rash',
    ],
  },
  cough: {
    description: 'Reflex action to clear airways of mucus and irritants',
    selfCare: [
      'Stay hydrated',
      'Use a humidifier',
      'Honey (for adults and children over 1)',
      'Avoid irritants like smoke',
    ],
    redFlags: [
      'Coughing up blood',
      'Difficulty breathing or wheezing',
      'Fever above 100.4°F',
      'Cough lasting more than 3 weeks',
      'Chest pain',
    ],
  },
  // Add more symptoms as needed
};
