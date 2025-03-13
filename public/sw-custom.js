// public/sw-custom.js
// Simple service worker for push notifications only

self.addEventListener('install', event => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated');
});

// Handle push notifications sent from the server
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Time to check your habit!',
      icon: '/icons/icon-192x192.png',
      tag: data.habitId || 'general',
      data: { url: '/' },
      vibrate: [100, 50, 100]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Habit Reminder', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});