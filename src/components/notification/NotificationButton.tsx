// components/NotificationButton.tsx
"use client";

import { useState } from "react";
import { subscribeToPushNotifications } from "@/utils/notification/pushSubscription";
import { useSession } from "next-auth/react";

export default function NotificationButton() {
  const { data: session } = useSession();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const enableNotifications = async () => {
    if (!session?.user?.email) {
      setStatus("Please log in first");
      return;
    }

    setStatus("Enabling notifications...");
    setLoading(true);
    
    try {
      await subscribeToPushNotifications(session.user.email);
      setStatus("Notifications enabled! You'll receive reminders for your habits.");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      setStatus("Failed to enable notifications. Please ensure you allow notifications when prompted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button 
        onClick={enableNotifications}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Enabling..." : "Enable Notifications"}
      </button>
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}