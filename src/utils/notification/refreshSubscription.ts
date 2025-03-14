// utils/notification/refreshSubscription.ts (client-side file)

export async function refreshPushSubscription(email: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push notifications not supported in this browser');
        return null;
    }
    
    if (!email) {
        console.error('Email is required to refresh subscription');
        return null;
    }
    
    try {
        // Unsubscribe from any existing subscriptions first
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
            console.log('Unsubscribing from existing subscription');
            await existingSubscription.unsubscribe();
        }
        
        // Create a new subscription
        console.log('Creating new push subscription');
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
        
        // Send the new subscription to your server
        const response = await fetch('/api/notification/save-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                subscription,
                email // Include email directly
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', response.status, errorText);
            throw new Error(`Failed to save subscription on server: ${response.status}`);
        }
        
        console.log('Push subscription refreshed successfully');
        return subscription;
    } catch (error) {
        console.error('Error refreshing push subscription:', error);
        throw error;
    }
}

// Helper function to convert base64 to Uint8Array
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