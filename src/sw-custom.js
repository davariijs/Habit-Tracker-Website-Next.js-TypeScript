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
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received:', event);
  
  try {
    const data = event.data.json();
    console.log('[Service Worker] Push Data:', data);
    
    const options = {
      body: data.body || 'Time to track your habit!',
      icon: '/icons/icon-192x192.png', // Add your app icon path
      data: {
        habitId: data.habitId,
        url: `/habits/${data.habitId}`
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (err) {
    console.error('[Service Worker] Error processing push:', err);
    
    // Fallback notification if data parsing fails
    event.waitUntil(
      self.registration.showNotification('Habit Reminder', {
        body: 'Time to check your habits!'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  // Open the app and navigate to the specific habit if possible
  const habitUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.openWindow(habitUrl)
  );
});