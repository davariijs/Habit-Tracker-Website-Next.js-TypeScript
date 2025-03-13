// components/NotificationButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NotificationButton() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setSupported(false);
      setStatus("Your browser doesn't support notifications");
    }
  }, []);

  // Convert VAPID key to array buffer
  const urlBase64ToUint8Array = (base64String: string) => {
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

  const enableNotifications = async () => {
    if (!session?.user?.email) {
      setStatus("Please login first");
      return;
    }

    if (!supported) {
      setStatus("Your browser doesn't support notifications");
      return;
    }

    setLoading(true);
    setStatus("Starting notification setup...");

    try {
      // Step 1: Request permission
      setStatus("Requesting permission...");
      const permissionResult = await Notification.requestPermission();
      
      if (permissionResult !== 'granted') {
        setStatus("You denied notification permission");
        setLoading(false);
        return;
      }
      
      // Step 2: Register service worker
      setStatus("Registering service worker...");
      let swRegistration;
      try {
        swRegistration = await navigator.serviceWorker.register('/sw-custom.js');
        console.log('Service worker registered successfully', swRegistration);
      } catch (err) {
        console.error('Service worker registration failed:', err);
        throw new Error("Failed to register service worker");
      }
      
      // Step 3: Wait for the service worker to be ready
      setStatus("Waiting for service worker...");
      await navigator.serviceWorker.ready;
      
      // Step 4: Get public key from server
      setStatus("Getting public key...");
      const response = await fetch('/api/notification/vapid-public-key');
      const { publicKey } = await response.json();
      
      if (!publicKey) {
        throw new Error("Could not get public key from server");
      }
      
      // Step 5: Subscribe to push notifications
      setStatus("Creating subscription...");
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      
      console.log('Created push subscription:', subscription);
      
      // Step 6: Send subscription to server
      setStatus("Saving subscription...");
      const saveRes = await fetch('/api/notification/save-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          subscription: subscription
        }),
      });
      
      if (!saveRes.ok) {
        throw new Error("Failed to save subscription on server");
      }
      
      // Step 7: Send test notification
      setStatus("Sending test notification...");
      const testRes = await fetch('/api/notification/test-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email
        }),
      });
      
      if (!testRes.ok) {
        const errorData = await testRes.json();
        throw new Error(`Test notification failed: ${errorData.error || 'Unknown error'}`);
      }
      
      setStatus("✅ Notification setup complete! You should receive a test notification.");
    } catch (error) {
      console.error('Error setting up notifications:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button 
        onClick={enableNotifications}
        disabled={loading || !supported || !session?.user?.email}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Setting up..." : "Enable Notifications"}
      </button>
      {status && (
        <p className="mt-2 text-sm">
          Status: {status}
        </p>
      )}
    </div>
  );
}