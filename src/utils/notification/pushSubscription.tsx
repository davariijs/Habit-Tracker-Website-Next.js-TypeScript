export const subscribeToPushNotifications = async (userEmail: string) => {
  if (!userEmail) {
    console.error("❌ Cannot subscribe: userEmail is missing");
    return;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("❌ Push notifications are not supported in this browser.");
    return;
  }

  // Move the function outside the try block
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  try {
    // Get the public key
    const publicKeyResponse = await fetch("/api/notification/vapid-public-key");
    const { publicKey } = await publicKeyResponse.json();
    
    if (!publicKey) {
      throw new Error("VAPID public key is missing");
    }

    // Wait for service worker registration
    const registration = await navigator.serviceWorker.ready;
    console.log("Service Worker is ready");

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    console.log("Push subscription successful");

    // Save the subscription to the server
    const response = await fetch("/api/notification/save-subscription", {
      method: "POST",
      body: JSON.stringify({ email: userEmail, subscription }),
      headers: { "Content-Type": "application/json" }
    });

    if (response.ok) {
      console.log("Subscription saved successfully");
      return subscription;
    } else {
      console.error("❌ Failed to save push subscription:", await response.json());
      throw new Error("Failed to save subscription");
    }
  } catch (error) {
    console.error("❌ Error subscribing to push notifications:", error);
    throw error;
  }
};