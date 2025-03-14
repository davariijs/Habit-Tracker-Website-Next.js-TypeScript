'use client';
import { useEffect } from "react";

const NotificationChecker = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log("Checking for notifications...");
      await fetch("/api/notification/check-now");
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default NotificationChecker;