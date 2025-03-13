// components/NotificationTest.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function NotificationTest() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendTestNotification = async () => {
    if (!session?.user?.email) {
      setMessage("Please log in first");
      return;
    }

    setLoading(true);
    setMessage("Sending test notification...");

    try {
      const response = await fetch("/api/notification/test-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("✅ Test notification sent! You should receive it shortly.");
      } else {
        setMessage(`❌ Error: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Failed to send"}`);
    } finally {
      setLoading(false);
    }
  };

  const checkNotifications = async () => {
    setLoading(true);
    setMessage("Checking notifications...");

    try {
      const response = await fetch("/api/notification/check-now", {
        method: "POST",
        headers: { "Cache-Control": "no-cache" }
      });
      
      const result = await response.json();
      
      setMessage(`✅ Checked ${result.total} habits, sent ${result.sent} notifications.`);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Failed to check"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold">Test Notifications</h4>
      <div className="flex space-x-2">
        <button
          onClick={sendTestNotification}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          Send Test Notification
        </button>
        
        <button
          onClick={checkNotifications}
          disabled={loading}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Check Habit Notifications
        </button>
      </div>
      
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}