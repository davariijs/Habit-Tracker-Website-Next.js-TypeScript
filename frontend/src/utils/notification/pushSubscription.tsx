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
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });

    console.log("📤 Sending subscription to backend:", { email: userEmail, subscription });

    await fetch("/api/notification/save-subscription", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, subscription }), // ✅ Send email instead of userId
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Push subscription saved!");
  } catch (error) {
    console.error("❌ Error subscribing to push notifications:", error);
  }
};