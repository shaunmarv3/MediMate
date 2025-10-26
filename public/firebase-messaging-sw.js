// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Store messaging instance
let messaging = null;

// Fetch Firebase config from the parent page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebase.initializeApp(event.data.config);
    messaging = firebase.messaging();
    
    // Setup background message handler after initialization
    messaging.onBackgroundMessage((payload) => {
      console.log('Received background message:', payload);

      const notificationTitle = payload.notification?.title || payload.data?.title || 'MediMate Reminder';
      const notificationBody = payload.notification?.body || payload.data?.body || 'Time to take your medication';

      const notificationOptions = {
        body: notificationBody,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'medication-reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: payload.data,
        actions: [
          {
            action: 'mark-taken',
            title: 'Mark as Taken'
          },
          {
            action: 'view',
            title: 'View Details'
          }
        ]
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'mark-taken') {
    // Open app and mark medication as taken
    event.waitUntil(
      clients.openWindow('/medications?action=mark-taken&id=' + event.notification.data?.medicationId)
    );
  } else if (event.action === 'view') {
    // Open medications page
    event.waitUntil(
      clients.openWindow('/medications')
    );
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
