// components/NotificationButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function NotificationButton() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'active' | 'expired'>('none');

  // Check subscription status on load
  useEffect(() => {
    if (!session?.user?.email) return;
    
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/get-subscription-status?email=${encodeURIComponent(session.user.email as string)}`);
        const data = await res.json();
        
        if (data.hasSubscription && !data.expired) {
          setSubscriptionStatus('active');
        } else if (data.hasSubscription && data.expired) {
          setSubscriptionStatus('expired');
          setStatus("Your notification subscription has expired. Please enable notifications again.");
        } else {
          setSubscriptionStatus('none');
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };
    
    checkStatus();
  }, [session?.user?.email]);

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

    setLoading(true);
    setStatus("Enabling notifications...");

    try {
      // First, unregister any existing service workers
      if (subscriptionStatus === 'expired') {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        console.log("Unregistered existing service workers");
      }

      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setStatus("Permission denied. Please allow notifications in your browser settings.");
        setLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw-custom.js');
      
      // Wait for service worker to activate
      await navigator.serviceWorker.ready;
      
      // Get public key
      const response = await fetch('/api/notification/vapid-public-key');
      const { publicKey } = await response.json();

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      // Save subscription
      const saveResponse = await fetch('/api/notification/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: session.user.email, 
          subscription 
        })
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save subscription");
      }

      setSubscriptionStatus('active');
      setStatus("✅ Notifications enabled! Sending test notification...");

      // Send test notification
      const testResponse = await fetch('/api/notification/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });

      if (testResponse.ok) {
        setStatus("✅ Notifications enabled! You should receive a test notification.");
      } else {
        const errorData = await testResponse.json();
        throw new Error(`Test notification failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (subscriptionStatus === 'active') return "Test Notification";
    if (subscriptionStatus === 'expired') return "Resubscribe to Notifications";
    return "Enable Notifications";
  };

  return (
    <div className="my-4">
      <button 
        onClick={enableNotifications}
        disabled={loading || !session?.user?.email}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Setting up..." : getButtonText()}
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
      
      {subscriptionStatus === 'active' && !status && (
        <p className="mt-2 text-sm text-green-600">
          Notifications are currently enabled
        </p>
      )}
    </div>
  );
}