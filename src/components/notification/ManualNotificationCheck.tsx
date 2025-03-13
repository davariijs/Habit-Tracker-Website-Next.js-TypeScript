// components/NotificationCheck.tsx
"use client";

import { useState } from "react";

export default function NotificationCheck() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const checkNow = async () => {
    setLoading(true);
    setResult("Checking...");
    
    try {
      const response = await fetch("/api/notification/check-now", { 
        method: "POST",
        headers: { "Cache-Control": "no-cache" }
      });
      
      const data = await response.json();
      
      setResult(`Checked ${data.total} habits, sent ${data.sent} notifications`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={checkNow}
        disabled={loading}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Notifications Now"}
      </button>
      {result && <p className="mt-2 text-sm">{result}</p>}
    </div>
  );
}