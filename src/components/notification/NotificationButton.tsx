"use client";

import { useState } from "react";
import { subscribeToPushNotifications } from "@/utils/notification/pushSubscription";
import { useSession } from "next-auth/react";

export default function NotificationButton() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("");

  const enableNotifications = async () => {
    if (!session?.user?.email) {
      setStatus("Please log in first");
      return;
    }

    setStatus("Enabling notifications...");
    try {
      await subscribeToPushNotifications(session.user.email);
      setStatus("Notifications enabled!");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setStatus("Failed to enable notifications");
    }
  };

  return (
    <div>
      <button 
        onClick={enableNotifications}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enable Notifications
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}