// components/NotificationHandler.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function NotificationHandler() {
  const { data: session } = useSession();
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.email) return;
    
    // Function to check for notifications
    const checkNotifications = async () => {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const res = await fetch("/api/notification/check-now", { 
          method: "POST",
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal // Add abort signal
        });
        
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        
        const data = await res.json();
        setLastCheck(new Date().toLocaleTimeString());
        
        if (data.sent > 0) {
          console.log(`✅ Sent ${data.sent} notifications out of ${data.total} habits`);
        } else {
          console.log(`Checked ${data.total} habits, no notifications sent`);
        }
      } catch (error:any) {
        if (error.name === 'AbortError') {
          console.log("Notification check timed out");
        } else {
          console.error("Error checking notifications:", error);
        }
      } finally {
        clearTimeout(timeoutId); // Clear timeout
      }
    };
    
    // Check immediately when component mounts
    checkNotifications();
    
    // Then check every minute
    const interval = setInterval(checkNotifications, 60 * 1000);
    
    // Also check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user?.email]);

  return null;
}