// const CACHE_NAME = "habit-tracker-cache-v1";
// const STATIC_ASSETS = [
//   "/",
//   "/manifest.json",
//   "/icons/icon-192x192.png",
//   "/icons/icon-512x512.png",
//   "/offline.html" // Ensure this file exists!
// ];

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       console.log("Service Worker: Caching static assets");
//       return cache.addAll(STATIC_ASSETS);
//     })
//     .then(() => {
//        self.skipWaiting(); // Force activation
//     })
//   );
//   console.log("Service Worker Installed");
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames
//           .filter((name) => name !== CACHE_NAME && name.startsWith("habit-tracker-cache-")) // More robust cache cleanup
//           .map((name) => caches.delete(name))
//       );
//     })
//     .then(() => {
//           self.clients.claim(); // Take control of all pages immediately
//     })
//   );
//   console.log("Service Worker Activated");
// });

// self.addEventListener("fetch", (event) => {
//   // 1. Handle only GET requests for caching.
//   if (event.request.method !== "GET") {
//     // If it's not a GET request, let the network handle it.
//     console.log(`Service Worker: Bypassing cache for ${event.request.method} request to ${event.request.url}`);
//     return; // Important: Do *not* call event.respondWith() for non-GET requests.
//   }

//   // 2. Respond from cache if available.
//   event.respondWith(
//     caches.match(event.request).then((cachedResponse) => {
//       if (cachedResponse) {
//         console.log(`Service Worker: Serving from cache: ${event.request.url}`);
//         return cachedResponse; // Serve from cache
//       }

//       // 3. Fetch from network, cache, and return response.
//       console.log(`Service Worker: Fetching from network: ${event.request.url}`);
//       return fetch(event.request)
//         .then((networkResponse) => {
//           // 4. Check for valid response before caching.
//           if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
//              console.log(`Service Worker: Not caching response for ${event.request.url} (status: ${networkResponse.status}, type: ${networkResponse.type})`);
//             return networkResponse; // Return, but don't cache.
//           }

//           // 5. Cache the successful GET response.
//           return caches.open(CACHE_NAME).then((cache) => {
//             console.log(`Service Worker: Caching new resource: ${event.request.url}`);
//             cache.put(event.request, networkResponse.clone()); // Clone is crucial!
//             return networkResponse;
//           });
//         })
//         .catch(() => {
//           // 6. Handle offline case.
//           console.log(`Service Worker: Offline, serving offline.html for ${event.request.url}`);
//           return caches.match("/offline.html").then((offlinePage) => {
//             return offlinePage || new Response("You are offline", {
//               status: 503,
//               statusText: "Service Unavailable",
//               headers: { "Content-Type": "text/html" }
//             });
//           });
//         });
//     })
//   );
// });

// Push Notification Support
self.addEventListener("push", (event) => {
    if (event.data) {
      const data = event.data.json();
      console.log("🔔 Received push notification:", data);
  
      const options = {
        body: data.body || "You have a new reminder!",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-96x96.png", // ✅ Add a badge icon for better UX
        timestamp: Date.now(), // ✅ Add timestamp for logging
        vibrate: [200, 100, 200], // ✅ Add vibration pattern for better user experience
        actions: [
          {
            action: "open_app",
            title: "Open App",
          },
        ],
      };
  
      event.waitUntil(
        self.registration.showNotification(data.title || "Habit Reminder", options)
      );
    } else {
      console.log("❌ Push event received but no data.");
    }
  });
  
  // ✅ Handle notification click event
  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    if (event.action === "open_app") {
      event.waitUntil(clients.openWindow("/")); // ✅ Open the app when clicked
    }
  });