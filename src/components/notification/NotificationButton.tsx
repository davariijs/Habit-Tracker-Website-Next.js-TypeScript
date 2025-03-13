// components/NotificationDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import NotificationButton from "./NotificationButton";

export default function NotificationDashboard() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<{
    permission: string;
    subscription: boolean;
    lastCheck: string | null;
  }>({
    permission: "unknown",
    subscription: false,
    lastCheck: null
  });
  
  useEffect(() => {
    if (!session?.user?.email) return;
    
    // Check notification status
    const checkStatus = async () => {
      try {
        // Check browser permission
        const permission = "Notification" in window 
          ? Notification.permission 
          : "unsupported";
        
        // Check subscription status in our database
        const res = await fetch(`/api/get-subscription-status?email=${encodeURIComponent(session.user.email as string)}`);
        const { expired, hasSubscription } = await res.json();
        
        setStatus({
          permission,
          subscription: hasSubscription && !expired,
          lastCheck: new Date().toLocaleTimeString()
        });
      } catch (error) {
        console.error("Error checking notification status:", error);
      }
    };
    
    checkStatus();
  }, [session?.user?.email]);
  
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Notification Settings</h3>
      
      {!session?.user ? (
        <p className="text-orange-500">Please login to enable notifications</p>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Browser Permission:</span>
              <span className={`${status.permission === 'granted' ? 'text-green-600' : 'text-red-500'}`}>
                {status.permission}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Subscription Active:</span>
              <span className={`${status.subscription ? 'text-green-600' : 'text-red-500'}`}>
                {status.subscription ? 'Yes' : 'No'}
              </span>
            </div>
            
            {status.lastCheck && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Last checked:</span>
                <span>{status.lastCheck}</span>
              </div>
            )}
          </div>
          
          <NotificationButton />
          
          <p className="mt-4 text-sm text-gray-500">
            Keep this app open in your browser to receive notifications.
          </p>
        </>
      )}
    </div>
  );
}