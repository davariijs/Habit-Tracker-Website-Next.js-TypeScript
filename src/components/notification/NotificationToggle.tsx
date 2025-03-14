'use client'
import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Switch, FormControlLabel } from '@mui/material';
import { toast } from 'sonner';
import { useRef } from 'react';


const NotificationToggle = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const { data: session } = useSession();
    const userEmail = session?.user?.email as string;
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const toastShown = useRef(false);

    function urlBase64ToUint8Array(base64String: string) {
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
    }

    // Check subscription status and update state
    const checkSubscriptionStatus = async () => {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            const registration = await navigator.serviceWorker.getRegistration('/sw-custom.js');
            const currentPermission = Notification.permission;
            setPermission(currentPermission); // Update permission

            if (registration) {
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
                const preference = localStorage.getItem('notificationsEnabled');
                setIsEnabled(subscription ? preference === 'true' : false);
            } else {
                setIsSubscribed(false);
                setIsEnabled(false);
            }
        }
    };

    // Initial permission check (runs only once)
    useEffect(() => {
        const checkInitialPermission = async () => {
            if ('Notification' in window) {
                if (Notification.permission === 'denied' && !toastShown.current) {
                    toast.error('Notification permission is blocked. Please enable it in your browser settings.');
                    toastShown.current = true;
                }
            }
            // Check subscription status after initial permission check
            await checkSubscriptionStatus();
        };
        checkInitialPermission();
    }, []);

    // Check subscription when userEmail changes
    useEffect(() => {
        setEmail(userEmail);
        checkSubscriptionStatus();
    }, [userEmail]);

    const handleToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setIsEnabled(newValue);
        localStorage.setItem('notificationsEnabled', String(newValue));

        if (newValue) {
            await subscribeUserToPush();
        } else {
            await unsubscribeUserFromPush();
        }
        // Re-check status after toggle, in case permission changed
        await checkSubscriptionStatus();
    };

    const subscribeUserToPush = async () => {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
            console.error('Service workers or Notifications are not supported.');
            return;
        }

        try {
            let registration = await navigator.serviceWorker.getRegistration('/sw-custom.js');
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw-custom.js');
            }

            const publicKeyResponse = await fetch("/api/notification/vapid-public-key");
            const { publicKey } = await publicKeyResponse.json();

            // Request permission and handle the result
            if (Notification.permission !== 'granted') {
                 const newPermission = await Notification.requestPermission();
                    setPermission(newPermission); // Update permission state IMMEDIATELY

                if (newPermission !== 'granted') {
                    console.warn('Notification permission was not granted.');
                    setIsEnabled(false);
                    localStorage.setItem('notificationsEnabled', 'false');
                    if (!toastShown.current) {
                        toast.error('Notification permission was not granted.');
                        toastShown.current = true;
                    }
                    return; // Exit if permission is not granted
                }
            }


            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            if (subscription) {
                setIsSubscribed(true);
                const response = await fetch('/api/notification/save-subscription', {
                    method: 'POST',
                    body: JSON.stringify({ subscription, email: userEmail }),
                    headers: { 'Content-Type': 'application/json' },
                });

                const data = await response.json();
                if (!data.success) {
                    console.error('Failed to save subscription:', data.message);
                } else {
                    console.log('Subscription saved successfully:', data.message);
                }
            }

        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
        }
    };

    const unsubscribeUserFromPush = async () => {
      if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistration('/sw-custom.js');
            if (registration) {
              const subscription = await registration.pushManager.getSubscription();
              if (subscription) {
                await subscription.unsubscribe();
                console.log('User is unsubscribed:', subscription);
              }
                await registration.unregister();
                console.log('Service worker unregistered.');
                setPermission('default');
                setIsSubscribed(false);
            }
          } catch (error) {
            console.error('Error during unsubscription:', error);
          }
        }
  };

    return (
        <div>
            <FormControlLabel
                control={
                    <Switch
                        checked={isEnabled && isSubscribed}
                        onChange={handleToggle}
                        color="primary"
                        disabled={permission === 'denied'}
                    />
                }
                label="Notifications"
            />
        </div>
    );
};

export default NotificationToggle;