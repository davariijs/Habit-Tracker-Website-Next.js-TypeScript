const VAPID_PUBLIC_KEY = "BOMxWltad74aktHYDh_E0pMxs8kH2maU0tbS4MuEwI-BM_dibL1xcu66pQ5FXD6G9v0gfgHyNBWwyyGl5hRZsQI";

export const subscribeToPushNotifications = async (userEmail: string) => {
  if (!userEmail) {
    console.error("❌ Cannot subscribe: userEmail is missing");
    return;
  }

  console.log("📌 Attempting push subscription for user:", userEmail);

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("❌ Push notifications are not supported in this browser.");
    return;
  }

  try {
    // ✅ Step 1: Register the service worker (if not already registered)
    const registration = await navigator.serviceWorker.register("/sw.js");

    // ✅ Step 2: Ensure the service worker is ready
    await navigator.serviceWorker.ready;

    // ✅ Step 3: Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });

    // ✅ Step 4: Send subscription to the server
    const response = await fetch("/api/notification/save-subscription", {
      method: "POST",
      body: JSON.stringify({ email:userEmail, subscription }),
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      console.log("✅ Push subscription saved successfully!");
    } else {
      console.error("❌ Failed to save push subscription:", await response.json());
    }
  } catch (error) {
    console.error("❌ Error subscribing to push notifications:", error);
  }
};