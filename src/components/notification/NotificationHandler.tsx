"use client";

import { useEffect } from "react";
import { subscribeToPushNotifications } from "@/utils/notification/pushSubscription";
import { useSession } from "next-auth/react";

export default function NotificationHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    async function checkSubscription() {
      if (!session?.user?.email) {
        return;
      }

      try {
        const res = await fetch(`/api/get-subscription-status?email=${encodeURIComponent(session.user.email)}`);
        const { expired } = await res.json();

        if (expired) {
          console.warn("⚠️ Subscription expired. Requesting new subscription...");
          await subscribeToPushNotifications(session.user.email);
        }
      } catch (error) {
        console.error("❌ Error checking subscription status:", error);
      }
    }

    checkSubscription();
  }, [session?.user?.email]);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        await fetch("/api/notification/check-now", { method: "POST" });
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };
    
    // Check notifications immediately upon component mount
    checkNotifications();
    
    // Check notifications every 5 minutes
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session?.user?.email]);

  return null;
}