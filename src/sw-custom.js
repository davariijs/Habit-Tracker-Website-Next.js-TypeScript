// // src/sw-custom.js

// self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// // Custom precaching exclude list - prevents 404 errors
// self.__WB_MANIFEST = self.__WB_MANIFEST || [];
// const filteredManifest = (self.__WB_MANIFEST || []).filter(entry => 
//   !entry.url.includes('app-build-manifest.json')
// );

// workbox.precaching.precacheAndRoute(filteredManifest);

// // Handle push events
// self.addEventListener('push', function(event) {
//   if (!event.data) {
//     console.log('Push event but no data');
//     return;
//   }
  
//   try {
//     const data = event.data.json();
    
//     const options = {
//       body: data.body || 'Reminder for your habit',
//       icon: '/icons/icon-192x192.png',
//       badge: '/icons/icon-72x72.png',
//       data: {
//         url: data.url || '/',
//       },
//       actions: [
//         {
//           action: 'view',
//           title: 'View now'
//         }
//       ]
//     };
    
//     event.waitUntil(
//       self.registration.showNotification(data.title || 'Habit Reminder', options)
//     );
//   } catch (error) {
//     console.error('Error showing notification:', error);
//   }
// });

// // Handle notification clicks
// self.addEventListener('notificationclick', function(event) {
//   event.notification.close();
  
//   if (event.action === 'view' || !event.action) {
//     const urlToOpen = event.notification.data && event.notification.data.url 
//       ? event.notification.data.url
//       : '/';
      
//     event.waitUntil(
//       clients.openWindow(urlToOpen)
//     );
//   }
// });



// src/sw-custom.js
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    event.waitUntil(clients.claim());
  });
  
  self.addEventListener('push', (event) => {
    console.log('Push received:', event.data?.text());
    
    if (!event.data) {
      console.log('Push event but no data');
      return;
    }
    
    try {
      const data = event.data.json();
      
      const options = {
        body: data.body || 'Reminder for your habit',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
          timestamp: data.timestamp || new Date().toISOString(),
          url: data.url || '/'
        },
        vibrate: [100, 50, 100],
        actions: [
          {
            action: 'view',
            title: 'Open App'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Habit Reminder', options)
      );
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  });
  
  self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.notification.tag);
    event.notification.close();
    
    if (event.action === 'view' || !event.action) {
      const urlToOpen = event.notification.data?.url || '/';
        
      event.waitUntil(
        clients.openWindow(urlToOpen)
      );
    }
  });
  
  console.log('Service Worker loaded successfully!');