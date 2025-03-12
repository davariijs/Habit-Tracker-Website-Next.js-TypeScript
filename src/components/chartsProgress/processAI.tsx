"use client";

interface HabitTitleProps {
    habitId: string;
    range: 'week' | 'month' | 'year';
}


import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";

const ProcessAI: React.FC<HabitTitleProps> = ({ habitId, range }) => {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleGenerateSuggestion = async () => {
    if (!habitId) {
      setError("No habit selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, range }),
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch AI suggestion");
      }

      const data = await res.json();
      setSuggestion(data.suggestion || "No suggestion available.");
    } catch (err: any) {
      setError(err.message || "Error fetching suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">AI Goal & Habit Improvement</h2>
      <button
        onClick={handleGenerateSuggestion}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Generating..." : "Get AI Suggestion"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {suggestion && <FormattedSuggestion text={suggestion} />}
    </Card>
  );
};

const FormattedSuggestion: React.FC<{ text: string }> = ({ text }) => {
    const sections = text.split("\n").filter((line) => line.trim() !== "");

    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-700">🧠 AI Suggestions</h3>
        <div className="mt-2 space-y-3">
          {sections.map((line, index) => {
            if (line.startsWith("**") && line.includes(":** ")) {
              const parts = line.split(":** ");
              const headingText = parts[0].replace(/\*\*/g, "").trim();
              const paragraphText = parts[1]?.trim();
              return (
                <div key={index}>
                  <h4 className="text-md font-bold text-blue-600 mt-4">
                    {headingText}
                  </h4>
                  {paragraphText && <p className="text-gray-700">{paragraphText}</p>}
                </div>
              );
            } else if (/^\*\*.*\*\*$/.test(line)) {
              return (
                <h4 key={index} className="text-md font-bold text-blue-600 mt-4">
                  {line.replace(/\*\*/g, "")}
                </h4>
              );
            } else if (/^\*/.test(line) || /^-/.test(line)) {
              return (
                <li key={index} className="list-disc list-inside text-gray-700">
                  {line.replace(/^\* |^- /, "")}
                </li>
              );
            } else {
              return <p key={index} className="text-gray-700">{line}</p>;
            }
          })}
        </div>
      </div>
    );
  };

export default ProcessAI;