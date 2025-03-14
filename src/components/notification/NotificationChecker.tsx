'use client';
import { useEffect } from "react";

const NotificationChecker = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Checking for notifications...");
      await fetch("/api/notification/check-now", {
        method: "POST",
        headers: { "Cache-Control": "no-cache" }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default NotificationChecker;