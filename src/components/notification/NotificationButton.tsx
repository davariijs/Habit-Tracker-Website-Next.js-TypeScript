// components/NotificationButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NotificationButton() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unknown">("unknown");

  useEffect(() => {
    // Check if notifications are supported
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      setStatus("Your browser doesn't support notifications");
      return;
    }
    
    // Check current permission
    setPermission(Notification.permission);
  }, []);

  // Helper function to convert base64 to Uint8Array
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

  const enableNotifications = async () => {
    if (!session?.user?.email) {
      setStatus("Please log in first");
      return;
    }

    if (!supported) {
      setStatus("Your browser doesn't support notifications");
      return;
    }

    setLoading(true);
    setStatus("Requesting permission...");

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== "granted") {
        setStatus("You need to allow notifications in your browser settings");
        setLoading(false);
        return;
      }
      
      setStatus("Registering service worker...");
      
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw-custom.js");
      console.log("Service worker registered:", registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("Service worker ready");
      
      setStatus("Getting subscription details...");
      
      // Get the application server key
      const response = await fetch("/api/notification/vapid-public-key");
      const { publicKey } = await response.json();
      
      if (!publicKey) {
        throw new Error("Public key not available");
      }
      
      // Subscribe to push
      setStatus("Subscribing to push notifications...");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      
      console.log("Push subscription:", subscription);
      
      // Save subscription
      setStatus("Saving subscription...");
      const saveResponse = await fetch("/api/notification/save-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: session.user.email, 
          subscription 
        })
      });
      
      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        throw new Error(`Failed to save subscription: ${error.message || 'Unknown error'}`);
      }
      
      setStatus("Sending test notification...");
      
      // Send a test notification
      const testResponse = await fetch("/api/notification/test-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email })
      });
      
      if (!testResponse.ok) {
        const error = await testResponse.json();
        throw new Error(`Test notification failed: ${error.message || 'Unknown error'}`);
      }
      
      setStatus("✅ Notifications enabled! You should receive a test notification shortly.");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setStatus(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (permission === "granted") return "Send Test Notification";
    return "Enable Notifications";
  };

  return (
    <div className="my-4">
      <button 
        onClick={enableNotifications}
        disabled={loading || !supported || !session?.user?.email}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : getButtonText()}
      </button>
      {status && (
        <p className="mt-2 text-sm">
          {status}
        </p>
      )}
      {!session?.user?.email && (
        <p className="mt-2 text-sm text-orange-500">
          You need to be logged in to enable notifications
        </p>
      )}
    </div>
  );
}