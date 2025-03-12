export const subscribeToPushNotifications = async (userEmail: string) => {
  if (!userEmail) {
    console.error("❌ Cannot subscribe: userEmail is missing");
    return;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("❌ Push notifications are not supported in this browser.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw-custom.js");

    await navigator.serviceWorker.ready;


    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });


    const response = await fetch("/api/notification/save-subscription", {
      method: "POST",
      body: JSON.stringify({ email:userEmail, subscription }),
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
    } else {
      console.error("❌ Failed to save push subscription:", await response.json());
    }
  } catch (error) {
    console.error("❌ Error subscribing to push notifications:", error);
  }
};