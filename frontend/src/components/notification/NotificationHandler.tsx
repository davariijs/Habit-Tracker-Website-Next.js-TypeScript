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
    if (!session?.user?.email) {
        console.error("❌ Cannot subscribe to push notifications: email is undefined");
        return;
      }
    
      console.log("📌 Subscribing user to push notifications:", session.user.email);
      subscribeToPushNotifications(session.user.email);
  }, [session?.user.id]);

  return null; // This component doesn't render anything
}