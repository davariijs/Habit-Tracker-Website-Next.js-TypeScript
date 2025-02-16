const VAPID_PUBLIC_KEY = "BOMxWltad74aktHYDh_E0pMxs8kH2maU0tbS4MuEwI-BM_dibL1xcu66pQ5FXD6G9v0gfgHyNBWwyyGl5hRZsQI";

// export const subscribeToPushNotifications = async (userId: string) => {
//   if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
//     console.error("❌ Push notifications are not supported in this browser.");
//     return;
//   }

//   try {
//     // Register service worker
//     const registration = await navigator.serviceWorker.register("/sw.js");

//     // Subscribe to push notifications
//     const subscription = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: VAPID_PUBLIC_KEY,
//     });

//     // Send subscription to the backend
//     await fetch("/api/notification/save-subscription", {
//       method: "POST",
//       body: JSON.stringify({ userId, subscription }),
//       headers: { "Content-Type": "application/json" },
//     });

//     console.log("✅ Push subscription saved!");
//   } catch (error) {
//     console.error("❌ Error subscribing to push notifications:", error);
//   }
// };

export const subscribeToPushNotifications = async (userId: string) => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("❌ Push notifications are not supported in this browser.");
    return;
  }

  try {
    // Register service worker (this part is fine)
    const registration = await navigator.serviceWorker.register("/sw.js");

    // Wait for the service worker to be ready!
    await navigator.serviceWorker.ready; // <--- THIS IS THE KEY CHANGE

    // NOW you can subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });

    // Send subscription to the backend
    await fetch("/api/notification/save-subscription", {
      method: "POST",
      body: JSON.stringify({ userId, subscription }),
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Push subscription saved!");
  } catch (error) {
    console.error("❌ Error subscribing to push notifications:", error);
    throw error; // Re-throw for better error handling in the caller
  }
};