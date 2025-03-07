'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function NotificationSubscriber() {
  const { data: session } = useSession();
  const [status, setStatus] = useState('loading');

  const subscribeToNotifications = async () => {
    try {
      setStatus('subscribing');
      
      // Check if service worker is registered
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted');
      }
      
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      
      // Create subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BOMxWltad74aktHYDh_E0pMxs8kH2maU0tbS4MuEwI-BM_dibL1xcu66pQ5FXD6G9v0gfgHyNBWwyyGl5hRZsQI'
      });
      
      // Save subscription to database
      const response = await fetch('/api/notification/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save subscription');
      }
      
      setStatus('subscribed');
      console.log('✅ Successfully subscribed to push notifications');
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      setStatus('error');
    }
  };

  return (
    <div>
      {status === 'loading' && (
        <button 
          onClick={subscribeToNotifications}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Enable Notifications
        </button>
      )}
      {status === 'subscribing' && <p>Setting up notifications...</p>}
      {status === 'subscribed' && <p className="text-green-600">✅ Notifications enabled</p>}
      {status === 'error' && (
        <div>
          <p className="text-red-600">Failed to enable notifications</p>
          <button 
            onClick={subscribeToNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded mt-2"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}