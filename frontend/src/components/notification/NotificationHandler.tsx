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
    if (session?.user.id) {
      // ✅ Subscribe to push notifications only after login
      subscribeToPushNotifications(session?.user.id);
    }
  }, [session?.user.id]);

  return null; // This component doesn't render anything
}