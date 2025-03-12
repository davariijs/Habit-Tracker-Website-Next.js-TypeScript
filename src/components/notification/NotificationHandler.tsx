"use client";

import { useEffect } from "react";
import { subscribeToPushNotifications } from "@/utils/notification/pushSubscription";
import { useSession } from "next-auth/react";

export default function NotificationHandler() {
  const { data: session } = useSession();

  useEffect(() => {
    // ✅ Start the notification scheduler for reminders
    fetch("/api/notification/start-scheduler", { method: "POST" });
  }, []);

  useEffect(() => {
    async function checkSubscription() {
      if (!session?.user?.email) {
        console.error("❌ Cannot subscribe to push notifications: email is undefined or null");
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

  return null;
}