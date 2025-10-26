'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Pill, Plus, Clock, Calendar, X, Trash2, Bell, BellOff, CheckCircle2, Circle, Camera, Scan, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission, scheduleLocalNotification, getUpcomingDosesForToday } from '@/lib/notifications';
import { calculateAndStoreAdherence } from '@/lib/adherenceCalculator';
import CloudinaryUpload from '@/components/CloudinaryUpload';

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [takenToday, setTakenToday] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanningBottle, setScanningBottle] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [interactionWarning, setInteractionWarning] = useState(null);
  const fileInputRef = useRef(null);
  
  // Helper to get local date in YYYY-MM-DD format (avoid timezone issues)
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    startDate: getLocalDateString(),
    endDate: '',
    instructions: '',
    quantity: '',
    expirationDate: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!user) return;

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Fetch today's medication intake logs
    const fetchTodayIntake = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const intakeQuery = query(
        collection(db, 'users', user.uid, 'medicationIntake'),
        where('date', '==', todayStr)
      );

      const snapshot = await getDocs(intakeQuery);
      const intakeMap = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        intakeMap[data.medicationId] = true;
      });
      setTakenToday(intakeMap);
    };

    fetchTodayIntake();

    const q = query(
      collection(db, 'users', user.uid, 'medications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter out expired medications and delete them
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      meds.forEach((med) => {
        if (med.endDate) {
          const endDate = new Date(med.endDate);
          endDate.setHours(23, 59, 59, 999);

          if (endDate < today) {
            // Delete expired medication
            deleteDoc(doc(db, 'users', user.uid, 'medications', med.id));
          }
        }
      });

      // Set only active medications
      const activeMeds = meds.filter((med) => {
        if (med.endDate) {
          const endDate = new Date(med.endDate);
          endDate.setHours(23, 59, 59, 999);
          return endDate >= today;
        }
        return true;
      });

      setMedications(activeMeds);

      // Schedule notifications for today's upcoming doses
      if (notificationPermission === 'granted') {
        const upcomingDoses = getUpcomingDosesForToday(activeMeds);
        upcomingDoses.forEach((dose) => {
          scheduleLocalNotification(dose.medicationName, dose.instructions, dose.scheduledTime);
        });
      }
    });

    return unsubscribe;
  }, [user, notificationPermission]);

  // Check for low stock and expiration warnings
  useEffect(() => {
    if (!medications.length) return;

    const checkMedicationWarnings = () => {
      // Create local midnight dates (avoid UTC timezone issues)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      // Format for logging as local dates
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const sevenDaysStr = `${sevenDaysFromNow.getFullYear()}-${String(sevenDaysFromNow.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysFromNow.getDate()).padStart(2, '0')}`;

      console.log('🔍 Checking medication warnings...', {
        medicationsCount: medications.length,
        today: todayStr,
        sevenDaysFromNow: sevenDaysStr
      });

      medications.forEach((med) => {
        // Check for low stock (running out in 7 days or less)
        if (med.daysRemaining !== null && med.daysRemaining <= 7 && med.daysRemaining > 0) {
          const warningKey = `refill-${med.id}-${med.daysRemaining}`;
          
          // Only show each warning once per day
          const lastWarning = localStorage.getItem(warningKey);
          
          console.log(`📊 ${med.name} - Low stock check:`, {
            daysRemaining: med.daysRemaining,
            lastWarning,
            todayStr,
            willShow: lastWarning !== todayStr
          });
          
          if (lastWarning !== todayStr) {
            // Show toast notification
            toast.warning(
              `⚠️ Low Stock: ${med.name} - Only ${med.daysRemaining} days remaining!`,
              {
                duration: 6000,
                action: {
                  label: 'Dismiss',
                  onClick: () => {},
                },
              }
            );
            
            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification('⚠️ Medication Running Low', {
                body: `${med.name} - Only ${med.daysRemaining} day${med.daysRemaining !== 1 ? 's' : ''} remaining. Time to refill!`,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                tag: `refill-warning-${med.id}`,
                requireInteraction: true,
                vibrate: [200, 100, 200],
              });
            }
            
            localStorage.setItem(warningKey, todayStr);
          }
        }

        // Check for expiration within 7 days
        if (med.expirationDate) {
          // Parse expiration date as local date (avoid UTC timezone issues)
          const dateParts = med.expirationDate.split('T')[0].split('-').map(Number);
          const expirationDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 23, 59, 59, 999);
          
          const expiryStr = `${expirationDate.getFullYear()}-${String(expirationDate.getMonth() + 1).padStart(2, '0')}-${String(expirationDate.getDate()).padStart(2, '0')}`;
          
          console.log(`📅 ${med.name} - Expiration check:`, {
            expirationDate: expiryStr,
            today: todayStr,
            sevenDaysFromNow: sevenDaysStr,
            isWithinSevenDays: expirationDate <= sevenDaysFromNow && expirationDate >= today
          });
          
          if (expirationDate <= sevenDaysFromNow && expirationDate >= today) {
            const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
            const warningKey = `expiry-${med.id}-${daysUntilExpiration}`;
            
            const lastWarning = localStorage.getItem(warningKey);
            
            console.log(`⏰ ${med.name} - Will show expiry warning:`, {
              daysUntilExpiration,
              lastWarning,
              todayStr,
              willShow: lastWarning !== todayStr
            });
            
            if (lastWarning !== todayStr) {
              // Show toast notification
              toast.warning(
                `⏰ Expiring Soon: ${med.name} expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}!`,
                {
                  duration: 6000,
                  action: {
                    label: 'Dismiss',
                    onClick: () => {},
                  },
                }
              );
              
              // Show browser notification if permitted
              if (Notification.permission === 'granted') {
                new Notification('⏰ Medication Expiring Soon', {
                  body: `${med.name} expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}. Check if replacement is needed.`,
                  icon: '/icon-192.png',
                  badge: '/badge-72.png',
                  tag: `expiry-warning-${med.id}`,
                  requireInteraction: true,
                  vibrate: [200, 100, 200],
                });
              }
              
              localStorage.setItem(warningKey, todayStr);
            }
          }
        }
      });
    };

    // Check warnings on load
    checkMedicationWarnings();

    // Check warnings every 30 seconds (for real-time updates)
    const checkInterval = setInterval(() => {
      checkMedicationWarnings();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [medications]);

  // Handle image upload from Cloudinary and analyze with Gemini
  const handleCloudinaryUpload = async (imageUrl) => {
    setScanningBottle(true);
    setShowUploadModal(false);

    try {
      // Fetch the image from Cloudinary URL
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert to base64 for Gemini
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        try {
          const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

          if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
            toast.error('Gemini API key not configured');
            setScanningBottle(false);
            return;
          }

          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

          const requestBody = {
            contents: [{
              parts: [
                {
                  text: `You are a medication label reader. Analyze this image and determine if it shows a medication bottle, pill box, or prescription label.

FIRST, determine if this is a valid medication image:
- If YES: Extract the medication information
- If NO (e.g., random photo, food, person, etc.): Respond with {"isMedication": false, "reason": "brief explanation"}

If it IS a medication image, return ONLY a valid JSON object with these fields:
{
  "isMedication": true,
  "name": "medication name (required - the drug name)",
  "dosage": "dosage amount (e.g., 10mg, 5ml)",
  "quantity": "number of pills/tablets/doses (numeric value only)",
  "expirationDate": "expiration date in YYYY-MM-DD format",
  "instructions": "usage instructions (e.g., take with food, once daily)",
  "confidence": "high/medium/low - based on label clarity"
}

Rules:
- Use empty string "" if you cannot extract a specific field
- The "name" field should NEVER be empty for medication images
- If label is blurry/unclear, set confidence to "low"
- Do not include any markdown formatting, ONLY the JSON object`
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
            }
          };

          const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          const data = await geminiResponse.json();

          if (!geminiResponse.ok) {
            console.error('API Error:', data);
            throw new Error(data.error?.message || 'Failed to scan bottle');
          }

          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean up response and parse JSON
          let cleanedResponse = textResponse.trim();
          cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          const extractedData = JSON.parse(cleanedResponse);

          // Validate if image contains medication
          if (extractedData.isMedication === false) {
            setScanningBottle(false);
            toast.error(`❌ Not a medication image: ${extractedData.reason || 'This doesn\'t appear to be a pill bottle or prescription.'}`, {
              duration: 5000,
            });
            return;
          }

          // Check if we extracted meaningful data
          if (!extractedData.name || extractedData.name.trim() === '') {
            setScanningBottle(false);
            toast.error('❌ Could not read medication name. Please ensure the label is clear and try again.', {
              duration: 5000,
            });
            return;
          }

          // Warn about low confidence
          if (extractedData.confidence === 'low') {
            toast.warning('⚠️ Image quality is low. Please review extracted data carefully.', {
              duration: 4000,
            });
          }

          console.log('✅ Extracted medication data:', extractedData);

          // Auto-fill form with extracted data AND the Cloudinary image URL
          setFormData(prev => ({
            ...prev,
            name: extractedData.name || prev.name,
            dosage: extractedData.dosage || prev.dosage,
            quantity: extractedData.quantity || prev.quantity,
            expirationDate: extractedData.expirationDate || prev.expirationDate,
            instructions: extractedData.instructions || prev.instructions,
            imageUrl: imageUrl, // Store Cloudinary URL
          }));

          // Show success animation
          setScanSuccess(true);
          setScanningBottle(false);
          setTimeout(() => setScanSuccess(false), 2000);

          const confidenceEmoji = extractedData.confidence === 'high' ? '✨' : extractedData.confidence === 'medium' ? '👍' : '⚠️';
          toast.success(`${confidenceEmoji} Bottle scanned! Please review and confirm details.`, {
            duration: 4000,
          });

          // Show form if not already visible
          setShowForm(true);

        } catch (error) {
          console.error('Error processing image with AI:', error);
          setScanningBottle(false);
          
          // Provide specific error messages
          if (error instanceof SyntaxError) {
            toast.error('❌ Failed to parse AI response. The image may be too unclear. Please try a clearer photo.', {
              duration: 5000,
            });
          } else if (error.message?.includes('API key')) {
            toast.error('❌ API configuration error. Please contact support.', {
              duration: 5000,
            });
          } else {
            toast.error('❌ Failed to analyze image. Please try again or enter medication details manually.', {
              duration: 5000,
            });
          }
        }
      };

    } catch (error) {
      console.error('Error fetching image from Cloudinary:', error);
      setScanningBottle(false);
      toast.error('❌ Failed to load image. Please check your internet connection and try again.', {
        duration: 5000,
      });
      setScanningBottle(false);
    }
  };

  // Legacy file input handler (kept for backward compatibility)
  const handleBottleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setScanningBottle(true);

    try {
      // Convert image to base64 for Gemini API (skip Firebase Storage upload)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        try {
          const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

          if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
            toast.error('Gemini API key not configured');
            setScanningBottle(false);
            return;
          }

          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

          const requestBody = {
            contents: [{
              parts: [
                {
                  text: `Extract medication information from this pill bottle or medication box image. Return ONLY a valid JSON object with these fields:
{
  "name": "medication name",
  "dosage": "dosage amount (e.g., 10mg, 5ml)",
  "quantity": "number of pills/tablets/doses",
  "expirationDate": "expiration date in YYYY-MM-DD format",
  "instructions": "usage instructions (e.g., take with food, once daily)"
}

If you cannot extract a field, use empty string "". Do not include any markdown formatting or extra text, ONLY the JSON object.`
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64Image
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
            }
          };

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.error?.message || 'Failed to scan bottle');
          }

          const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Clean up response and parse JSON
          let cleanedResponse = textResponse.trim();
          // Remove markdown code blocks if present
          cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          const extractedData = JSON.parse(cleanedResponse);

          // Auto-fill form with extracted data
          setFormData(prev => ({
            ...prev,
            name: extractedData.name || prev.name,
            dosage: extractedData.dosage || prev.dosage,
            quantity: extractedData.quantity || prev.quantity,
            expirationDate: extractedData.expirationDate || prev.expirationDate,
            instructions: extractedData.instructions || prev.instructions,
          }));

          // Show success animation
          setScanSuccess(true);
          setTimeout(() => setScanSuccess(false), 2000);

          toast.success('✨ Bottle scanned successfully! Please review and confirm details.', {
            duration: 4000,
          });

          // Show form if not already visible
          setShowForm(true);

        } catch (error) {
          console.error('Error processing image with AI:', error);
          toast.error('❌ Failed to extract medication info. Please enter manually.');
          setScanningBottle(false);
        }
      };

    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('❌ Failed to read image file. Please try again.');
      setScanningBottle(false);
    }
  };

  // Check for drug interactions using Gemini AI
  const checkDrugInteraction = async (newDrug, currentDrugs) => {
    try {
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
        console.error('Gemini API key not configured');
        return null;
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`;

      // Build current medications list
      const currentMedsList = currentDrugs.length > 0 
        ? currentDrugs.map(med => `${med.name} (${med.dosage})`).join(', ')
        : 'None';

      const requestBody = {
        contents: [{
          parts: [{
            text: `You are a pharmaceutical expert. Analyze potential drug interactions.

NEW MEDICATION: ${newDrug.name} ${newDrug.dosage}

CURRENT MEDICATIONS: ${currentMedsList}

Analyze for drug-drug interactions and provide a response in this EXACT JSON format:
{
  "severity": "Critical" | "Moderate" | "Minor" | "None",
  "hasInteraction": true/false,
  "explanation": "Detailed explanation of the interaction mechanism and risks",
  "specificRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "alternativeSuggestions": ["Alternative 1", "Alternative 2"],
  "recommendation": "Clear action recommendation"
}

Severity Levels:
- Critical: Life-threatening, DO NOT combine
- Moderate: Requires medical supervision, dose adjustment may be needed  
- Minor: Monitor for side effects, generally safe
- None: No known interactions

Return ONLY the JSON object, no markdown formatting.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Gemini API Error:', data);
        return null;
      }

      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Clean up response and parse JSON
      let cleanedResponse = textResponse.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      const interactionData = JSON.parse(cleanedResponse);
      
      console.log('✅ Drug Interaction Check:', interactionData);
      
      return interactionData;

    } catch (error) {
      console.error('Error checking drug interaction:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('📝 FORM SUBMITTED - Current formData:', {
      startDate: formData.startDate,
      expirationDate: formData.expirationDate,
      endDate: formData.endDate,
      name: formData.name
    });

    setLoading(true);

    try {
      // Check for drug interactions BEFORE adding medication
      if (medications.length > 0) {
        toast.loading('🔍 Checking for drug interactions...', { id: 'interaction-check' });
        
        const interactionResult = await checkDrugInteraction(
          { name: formData.name, dosage: formData.dosage },
          medications
        );

        toast.dismiss('interaction-check');

        // Store interaction check result in Firestore
        if (interactionResult) {
          try {
            await addDoc(collection(db, 'users', user.uid, 'drugInteractions'), {
              newDrug: {
                name: formData.name,
                dosage: formData.dosage
              },
              existingDrugs: medications.map(med => ({
                name: med.name,
                dosage: med.dosage
              })),
              severity: interactionResult.severity,
              hasInteraction: interactionResult.hasInteraction,
              explanation: interactionResult.explanation,
              timestamp: new Date().toISOString(),
            });
          } catch (err) {
            console.error('Failed to store interaction check:', err);
            // Non-blocking error - continue anyway
          }
        }

        if (interactionResult && interactionResult.hasInteraction) {
          const severityColors = {
            Critical: 'danger',
            Moderate: 'warning', 
            Minor: 'blue'
          };

          const severityEmojis = {
            Critical: '🚨',
            Moderate: '⚠️',
            Minor: 'ℹ️'
          };

          // Store interaction warning for modal
          setInteractionWarning({
            ...interactionResult,
            emoji: severityEmojis[interactionResult.severity],
            colorClass: severityColors[interactionResult.severity]
          });

          setLoading(false);
          return; // Stop here and show modal
        } else if (interactionResult && !interactionResult.hasInteraction) {
          toast.success('✅ No interactions detected. Safe to add!', { duration: 2000 });
        }
      }

      // Request notification permission (non-blocking, silent failure)
      requestNotificationPermission()
        .then(token => {
          if (token) {
            setNotificationPermission('granted');
            toast.success('Notifications enabled!', { duration: 2000 });
          }
        })
        .catch(err => {
          // Silently fail - don't show error to user
          console.log('Notifications not available:', err.message);
        });

      const schedule = formData.times.map(time => ({
        time,
        repeat: 'daily'
      }));

      // Calculate refill date if quantity is provided
      let refillDate = null;
      let daysRemaining = null;
      if (formData.quantity) {
        const quantity = parseInt(formData.quantity);
        const dosesPerDay = formData.times.length; // Number of times per day
        
        if (!isNaN(quantity) && dosesPerDay > 0) {
          daysRemaining = Math.floor(quantity / dosesPerDay);
          const refillDateObj = new Date();
          refillDateObj.setDate(refillDateObj.getDate() + daysRemaining);
          refillDate = refillDateObj.toISOString().split('T')[0];
        }
      }

      const medicationData = {
        name: formData.name,
        dosage: formData.dosage,
        schedule,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        instructions: formData.instructions,
        quantity: formData.quantity || null,
        expirationDate: formData.expirationDate || null,
        refillDate: refillDate,
        daysRemaining: daysRemaining,
        imageUrl: formData.imageUrl || null,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      console.log('🔥 SAVING TO FIRESTORE (Manual Form):', {
        startDate: medicationData.startDate,
        expirationDate: medicationData.expirationDate,
        endDate: medicationData.endDate
      });

      await addDoc(collection(db, 'users', user.uid, 'medications'), medicationData);

      toast.success('Medication added successfully with notifications!');

      // Schedule notifications for this medication
      if (notificationPermission === 'granted') {
        const today = new Date();
        schedule.forEach((scheduleItem) => {
          const [hours, minutes] = scheduleItem.time.split(':');
          const scheduleTime = new Date(today);
          scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          scheduleLocalNotification(formData.name, formData.instructions, scheduleTime.toISOString());
        });
      }

      setShowForm(false);
      setFormData({
        name: '',
        dosage: '',
        times: ['08:00'],
        startDate: getLocalDateString(),
        endDate: '',
        instructions: '',
        quantity: '',
        expirationDate: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const proceedWithAddingMedication = async () => {
    setInteractionWarning(null);
    setLoading(true);

    try {
      const schedule = formData.times.map(time => ({
        time,
        repeat: 'daily'
      }));

      // Calculate refill date if quantity is provided
      let refillDate = null;
      let daysRemaining = null;
      if (formData.quantity) {
        const quantity = parseInt(formData.quantity);
        const dosesPerDay = formData.times.length;
        
        if (!isNaN(quantity) && dosesPerDay > 0) {
          daysRemaining = Math.floor(quantity / dosesPerDay);
          const refillDateObj = new Date();
          refillDateObj.setDate(refillDateObj.getDate() + daysRemaining);
          refillDate = refillDateObj.toISOString().split('T')[0];
        }
      }

      const medicationData = {
        name: formData.name,
        dosage: formData.dosage,
        schedule,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        instructions: formData.instructions,
        quantity: formData.quantity || null,
        expirationDate: formData.expirationDate || null,
        refillDate: refillDate,
        daysRemaining: daysRemaining,
        imageUrl: formData.imageUrl || null,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      console.log('🔥 SAVING TO FIRESTORE (Pill Scanner):', {
        startDate: medicationData.startDate,
        expirationDate: medicationData.expirationDate,
        endDate: medicationData.endDate
      });

      await addDoc(collection(db, 'users', user.uid, 'medications'), medicationData);

      toast.success('✅ Medication added successfully!');

      setShowForm(false);
      setFormData({
        name: '',
        dosage: '',
        times: ['08:00'],
        startDate: getLocalDateString(),
        endDate: '',
        instructions: '',
        quantity: '',
        expirationDate: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (medId, medName) => {
    if (confirm(`Are you sure you want to delete ${medName}?`)) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'medications', medId));
        toast.success('Medication deleted successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete medication');
      }
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '12:00']
    });
  };

  const markAsTaken = async (medId, medName) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Check if already taken today
      if (takenToday[medId]) {
        toast.info('Already marked as taken for today');
        return;
      }

      // Log the medication intake
      await addDoc(collection(db, 'users', user.uid, 'medicationIntake'), {
        medicationId: medId,
        medicationName: medName,
        date: todayStr,
        timestamp: new Date().toISOString(),
        taken: true
      });

      // Update local state
      setTakenToday(prev => ({ ...prev, [medId]: true }));
      toast.success(`${medName} marked as taken!`);

      // Calculate and store updated adherence rate
      await calculateAndStoreAdherence(user.uid);
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark medication as taken');
    }
  };

  return (
    <div className="lg:ml-64 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Warning Banner for Critical Medications */}
        {medications.some(med => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(today.getDate() + 7);
          
          const hasLowStock = med.daysRemaining !== null && med.daysRemaining <= 7 && med.daysRemaining > 0;
          const hasExpiryWarning = med.expirationDate && 
            new Date(med.expirationDate + 'T23:59:59') <= sevenDaysFromNow &&
            new Date(med.expirationDate + 'T23:59:59') >= today;
          
          return hasLowStock || hasExpiryWarning;
        }) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-warning-50 to-danger-50 dark:from-warning-900/20 dark:to-danger-900/20 border-2 border-warning-400 dark:border-warning-600 rounded-xl"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-warning-600 dark:text-warning-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-warning-900 dark:text-warning-200 mb-2">
                  ⚠️ Medication Alerts
                </h3>
                <div className="space-y-1">
                  {medications
                    .filter(med => med.daysRemaining !== null && med.daysRemaining <= 7 && med.daysRemaining > 0)
                    .map(med => (
                      <p key={`refill-${med.id}`} className="text-sm text-warning-800 dark:text-warning-300">
                        • <strong>{med.name}</strong> - Running low! Only {med.daysRemaining} day{med.daysRemaining !== 1 ? 's' : ''} remaining
                      </p>
                    ))
                  }
                  {medications
                    .filter(med => {
                      if (!med.expirationDate) return false;
                      const expDate = new Date(med.expirationDate + 'T23:59:59');
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const sevenDays = new Date();
                      sevenDays.setDate(today.getDate() + 7);
                      return expDate <= sevenDays && expDate >= today;
                    })
                    .map(med => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const expDate = new Date(med.expirationDate + 'T23:59:59');
                      const daysUntilExpiry = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                      return (
                        <p key={`expiry-${med.id}`} className="text-sm text-danger-800 dark:text-danger-300">
                          • <strong>{med.name}</strong> - Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}!
                        </p>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
              Medications
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your medication schedule
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={scanningBottle || scanSuccess}
              className={`btn-outline flex items-center justify-center space-x-2 relative overflow-hidden transition-all duration-300 ${
                scanSuccess ? 'bg-success-500 text-white border-success-500 hover:bg-success-500' : ''
              }`}
            >
              <AnimatePresence mode="wait">
                {scanningBottle ? (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Scanning...</span>
                    <span className="sm:hidden">Scan...</span>
                  </motion.div>
                ) : scanSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Scanned!</span>
                    <span className="sm:hidden">Done!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center space-x-2"
                  >
                    <Scan className="w-5 h-5" />
                    <span className="hidden sm:inline">Scan Bottle</span>
                    <span className="sm:hidden">Scan</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Medication</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Hidden file input for camera/upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleBottleScan}
          className="hidden"
        />

        {/* Scanning Animation Overlay */}
        <AnimatePresence>
          {scanningBottle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-8 mb-8"
            >
              <div className="flex flex-col items-center justify-center space-y-6 py-12">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-primary-600 dark:text-primary-400 animate-spin" />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    🔍 Scanning Bottle...
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Our AI is reading your medication label
                  </p>
                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-primary-500 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-primary-500 rounded-full"
                    />
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-primary-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cloudinary Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card p-8 max-w-md w-full relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  📸 Scan Medication Bottle
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Upload a clear photo of your medication bottle or box. Our AI will extract the details automatically.
                </p>

                <CloudinaryUpload
                  onUpload={handleCloudinaryUpload}
                  folder="medication-bottles"
                  buttonText="Upload & Scan"
                  showPreview={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 mb-8 relative"
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close form"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>

            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Add New Medication
            </h2>

            {/* AI Scan Info Banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-purple-900 dark:text-purple-200 mb-1">
                    💡 Quick Tip: Scan Your Bottle!
                  </p>
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    Click "Scan Bottle" above to auto-fill this form by taking a photo of your medication bottle or box. Our AI will extract the details instantly!
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Permission Info */}
            {notificationPermission !== 'granted' && (
              <div className="mb-6 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl flex items-start space-x-3">
                <Bell className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-cyan-900 dark:text-cyan-200 mb-1">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-cyan-800 dark:text-cyan-300">
                    We'll request permission to send you medication reminders when you add this medication.
                  </p>
                </div>
              </div>
            )}

            {/* Drug Interaction Safety Banner */}
            {medications.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-green-900 dark:text-green-200 mb-1">
                      🛡️ Drug Interaction Check Enabled
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Our AI will automatically check for dangerous interactions with your {medications.length} existing medication{medications.length !== 1 ? 's' : ''} before adding this one.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {medications.slice(0, 3).map((med, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/40 text-xs font-medium text-green-800 dark:text-green-300 rounded-md">
                          <Pill className="w-3 h-3 mr-1" />
                          {med.name}
                        </span>
                      ))}
                      {medications.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/40 text-xs font-medium text-green-800 dark:text-green-300 rounded-md">
                          +{medications.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Medication Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Lisinopril"
                    required
                  />
                </div>
                <div>
                  <label className="label">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 10mg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Schedule Times</label>
                <div className="space-y-3">
                  {formData.times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...formData.times];
                          newTimes[index] = e.target.value;
                          setFormData({ ...formData, times: newTimes });
                        }}
                        className="input-field flex-1"
                        required
                      />
                      {formData.times.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              times: formData.times.filter((_, i) => i !== index)
                            });
                          }}
                          className="text-danger-600 dark:text-danger-400 hover:underline text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="text-primary-600 dark:text-primary-400 hover:underline text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add another time</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    min={formData.startDate}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Medication will be auto-deleted after this date
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Quantity (Optional)</label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 30 tablets"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Total pills/doses in bottle
                  </p>
                  {/* Show refill calculation preview */}
                  {formData.quantity && parseInt(formData.quantity) > 0 && formData.times.length > 0 && (
                    <div className="mt-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <p className="text-xs text-cyan-700 dark:text-cyan-300">
                        📊 Estimated: {Math.floor(parseInt(formData.quantity) / formData.times.length)} days supply
                        {Math.floor(parseInt(formData.quantity) / formData.times.length) <= 7 && (
                          <span className="ml-1 text-warning-600 dark:text-warning-400 font-medium">⚠️ Low stock</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="input-field"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    When medication expires
                  </p>
                </div>
              </div>

              <div>
                <label className="label">Instructions (Optional)</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Take with food"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 sm:gap-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2 relative overflow-hidden"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Adding Medication...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Add Medication</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-medium transition-all relative"
            >
              <button
                onClick={() => handleDelete(med.id, med.name)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors group"
                aria-label="Delete medication"
              >
                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-danger-600 dark:group-hover:text-danger-400" />
              </button>

              <div className="flex items-start justify-between mb-4 pr-8">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {med.imageUrl ? (
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-sm ring-2 ring-primary-100 dark:ring-primary-900/50">
                      <img 
                        src={med.imageUrl} 
                        alt={`${med.name} bottle`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                      <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {med.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {med.dosage}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{med.schedule?.length || 0}x daily</span>
                </div>
                {med.schedule?.slice(0, 2).map((s, i) => {
                  // Convert 24h to 12h format with AM/PM
                  const [hours, minutes] = s.time.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour % 12 || 12;
                  const displayTime = `${displayHour}:${minutes} ${ampm}`;

                  return (
                    <div key={i} className="text-slate-500 dark:text-slate-400 ml-5 sm:ml-6">
                      {displayTime}
                    </div>
                  );
                })}
                {med.endDate && (
                  <div className="flex items-center space-x-2 text-warning-600 dark:text-warning-400 mt-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">Ends: {new Date(med.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Refill Date Warning */}
                {med.quantity && med.refillDate && (
                  <div className={`flex items-center space-x-2 mt-3 ${
                    med.daysRemaining <= 5 
                      ? 'text-danger-600 dark:text-danger-400' 
                      : med.daysRemaining <= 10
                        ? 'text-warning-600 dark:text-warning-400'
                        : 'text-success-600 dark:text-success-400'
                  }`}>
                    <Pill className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {med.daysRemaining <= 5 
                        ? `⚠️ Running low! ${med.daysRemaining} days left`
                        : med.daysRemaining <= 10
                          ? `${med.daysRemaining} days remaining`
                          : `${med.quantity} doses available`
                      }
                    </span>
                  </div>
                )}

                {/* Expiration Date Warning */}
                {med.expirationDate && (
                  <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 mt-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Expires: {new Date(med.expirationDate).toLocaleDateString()}</span>
                  </div>
                )}

                {med.instructions && (
                  <p className="text-slate-500 dark:text-slate-400 italic mt-3">
                    {med.instructions}
                  </p>
                )}
              </div>

              {/* Mark as Taken Button */}
              <button
                onClick={() => markAsTaken(med.id, med.name)}
                disabled={takenToday[med.id]}
                className={`w-full mt-4 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center space-x-2 ${
                  takenToday[med.id]
                    ? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md'
                }`}
              >
                {takenToday[med.id] ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Taken Today</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5" />
                    <span>Mark as Taken</span>
                  </>
                )}
              </button>
            </motion.div>
          ))}

          {medications.length === 0 && !showForm && !scanningBottle && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full card p-8 sm:p-12 text-center"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Pill className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              </motion.div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                No medications yet
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Start by scanning a pill bottle or adding your first medication manually
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:space-x-3 sm:gap-0">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline flex items-center justify-center space-x-2"
                >
                  <Scan className="w-5 h-5" />
                  <span>Scan Bottle</span>
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Manually</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Drug Interaction Warning Modal */}
        <AnimatePresence>
          {interactionWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setInteractionWarning(null);
                setLoading(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="card max-w-2xl w-full relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Severity Header */}
                <div className={`p-6 ${
                  interactionWarning.severity === 'Critical' 
                    ? 'bg-gradient-to-r from-danger-500 to-danger-600' 
                    : interactionWarning.severity === 'Moderate'
                      ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                } text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{interactionWarning.emoji}</span>
                      <h2 className="text-2xl font-bold">
                        {interactionWarning.severity} Interaction Detected
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setInteractionWarning(null);
                        setLoading(false);
                      }}
                      className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-white/90">
                    {formData.name} {formData.dosage} may interact with your current medications
                  </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Explanation */}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>What's the Issue?</span>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {interactionWarning.explanation}
                    </p>
                  </div>

                  {/* Specific Risks */}
                  {interactionWarning.specificRisks && interactionWarning.specificRisks.length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                        <span>Potential Risks:</span>
                      </h3>
                      <ul className="space-y-2">
                        {interactionWarning.specificRisks.map((risk, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-danger-600 dark:text-danger-400 mt-1">•</span>
                            <span className="text-slate-600 dark:text-slate-300">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Alternatives */}
                  {interactionWarning.alternativeSuggestions && interactionWarning.alternativeSuggestions.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                      <h3 className="font-bold text-green-900 dark:text-green-200 mb-3 flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Safer Alternatives:</span>
                      </h3>
                      <ul className="space-y-2">
                        {interactionWarning.alternativeSuggestions.map((alt, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                            <span className="text-green-800 dark:text-green-300">{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <h3 className="font-bold text-cyan-900 dark:text-cyan-200 mb-2 flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Recommendation:</span>
                    </h3>
                    <p className="text-cyan-800 dark:text-cyan-300">
                      {interactionWarning.recommendation}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setInteractionWarning(null);
                      setLoading(false);
                      toast.info('❌ Medication not added. Please consult your doctor.');
                    }}
                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel - Don't Add
                  </button>
                  <button
                    onClick={proceedWithAddingMedication}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-colors ${
                      interactionWarning.severity === 'Critical'
                        ? 'bg-danger-600 hover:bg-danger-700'
                        : 'bg-warning-600 hover:bg-warning-700'
                    }`}
                  >
                    {interactionWarning.severity === 'Critical' ? '⚠️ Add Anyway (Not Recommended)' : 'Proceed with Caution'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
