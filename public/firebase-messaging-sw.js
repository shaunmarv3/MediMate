// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBTkrd2ncL-4WfzXEqH8iIY23mazPgQD8A",
  authDomain: "medimate-c0138.firebaseapp.com",
  projectId: "medimate-c0138",
  storageBucket: "medimate-c0138.firebasestorage.app",
  messagingSenderId: "987441419343",
  appId: "1:987441419343:web:f7c3ee9179ed96c697c63a"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title || 'MediMate Reminder';
  const notificationOptions = {
    body: payload.notification.body || 'Time to take your medication',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'medication-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'mark-taken',
        title: 'Mark as Taken'
      },
      {
        action: 'snooze',
        title: 'Snooze 15min'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'mark-taken') {
    // Open app and mark medication as taken
    event.waitUntil(
      clients.openWindow('/medications?action=mark-taken')
    );
  } else if (event.action === 'snooze') {
    // Snooze notification
    console.log('Snooze clicked');
  } else {
    // Default click - open app
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
