// public/sw-custom.js
// public/sw.js (or wherever your service worker is located)

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