// public/sw-custom.js
// Simple service worker focused only on push notifications

// Log service worker installation
self.addEventListener('install', event => {
    console.log('Service Worker installing');
    self.skipWaiting(); // Activate immediately
  });
  
  // Log service worker activation
  self.addEventListener('activate', event => {
    console.log('Service Worker activating');
    event.waitUntil(clients.claim()); // Take control immediately
  });
  
  // Handle push events
  self.addEventListener('push', event => {
    console.log('Push notification received', event);
    
    if (!event.data) {
      console.log('No data in push event');
      return;
    }
    
    // Parse notification data
    let notificationData;
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.log('Error parsing push data', e);
      const text = event.data.text();
      notificationData = {
        title: 'New Notification',
        body: text
      };
    }
    
    // Display the notification
    const title = notificationData.title || 'Habit Reminder';
    const options = {
      body: notificationData.body || 'Time to check your habit!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100]
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });
  
  // Handle notification clicks
  self.addEventListener('notificationclick', event => {
    console.log('Notification clicked', event);
    event.notification.close();
    
    // Open the app when notification is clicked
    event.waitUntil(
      clients.openWindow('/')
    );
  });
  
  console.log('SW: Push notification service worker loaded');