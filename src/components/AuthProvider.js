'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        displayName,
        email,
        createdAt: new Date().toISOString(),
        units: 'metric',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notificationPrefs: {
          email: true,
          push: false,
        },
      });
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      return result;
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          displayName: result.user.displayName,
          email: result.user.email,
          createdAt: new Date().toISOString(),
          units: 'metric',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          notificationPrefs: {
            email: true,
            push: false,
          },
        });
      }
      toast.success('Signed in with Google!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
