import { getMessagingInstance } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Request notification permission and get FCM token
export async function requestNotificationPermission() {
    try {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return null;
        }

        if (Notification.permission === 'granted') {
            return await getFCMToken();
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                return await getFCMToken();
            }
        }

        return null;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        // Don't throw error - return null to allow app to continue
        return null;
    }
}

// Get FCM token
async function getFCMToken() {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) {
            console.log('Firebase Messaging not available');
            return null;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey === 'your_vapid_key_here') {
            console.log('VAPID key not configured');
            return null;
        }

        // Check if service worker is available
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return null;
        }

        // Add timeout to prevent hanging
        const tokenPromise = getToken(messaging, {
            vapidKey: vapidKey
        }).catch(err => {
            // Suppress push service errors
            console.log('Push service not available:', err.message);
            return null;
        });

        const timeoutPromise = new Promise((resolve) => 
            setTimeout(() => resolve(null), 5000)
        );

        const token = await Promise.race([tokenPromise, timeoutPromise]);
        return token;
    } catch (error) {
        // Completely suppress all errors
        console.log('FCM token not available:', error.message);
        return null;
    }
}

// Setup foreground message listener
export function setupForegroundMessageListener(callback) {
    getMessagingInstance().then((messaging) => {
        if (!messaging) return;

        onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);

            const notificationTitle = payload.notification?.title || payload.data?.title || 'MediMate Reminder';
            const notificationBody = payload.notification?.body || payload.data?.body || 'Time to take your medication';

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(notificationTitle, {
                    body: notificationBody,
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    tag: 'medication-reminder',
                    requireInteraction: true,
                    vibrate: [200, 100, 200]
                });
            }

            // Call callback for in-app notification
            if (callback) {
                callback(payload);
            }
        });
    });
}

// Schedule local notification (when app is open)
export function scheduleLocalNotification(medicationName, instructions, scheduledTime) {
    const now = new Date();
    const scheduleDate = new Date(scheduledTime);
    const timeDiff = scheduleDate.getTime() - now.getTime();

    if (timeDiff > 0) {
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                const body = instructions
                    ? `${medicationName} - ${instructions}`
                    : `Time to take ${medicationName}`;

                new Notification('Medication Reminder', {
                    body,
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    tag: 'medication-reminder',
                    requireInteraction: true,
                    vibrate: [200, 100, 200]
                });
            }
        }, timeDiff);

        return true;
    }

    return false;
}

// Calculate next notification times for today
export function getUpcomingDosesForToday(medications) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcomingDoses = [];

    medications.forEach((med) => {
        // Check if medication is still active
        if (med.endDate) {
            const endDate = new Date(med.endDate);
            if (endDate < today) {
                return; // Skip expired medications
            }
        }

        // Get today's scheduled times
        med.schedule?.forEach((scheduleItem) => {
            const [hours, minutes] = scheduleItem.time.split(':');
            const scheduleTime = new Date(today);
            scheduleTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Only include future times
            if (scheduleTime > now) {
                upcomingDoses.push({
                    medicationId: med.id,
                    medicationName: med.name,
                    dosage: med.dosage,
                    instructions: med.instructions,
                    scheduledTime: scheduleTime.toISOString(),
                    time: scheduleItem.time
                });
            }
        });
    });

    // Sort by time
    upcomingDoses.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

    return upcomingDoses;
}
