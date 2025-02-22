"use client";

interface HabitTitleProps {
    habitId: string; // Add habitId prop
    range: 'week' | 'month' | 'year'; // Add range prop
}

import React, { useState } from "react";

const ProcessAI: React.FC<HabitTitleProps> = ({ habitId, range }) => { // Use habitId and range
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSuggestion = async () => {
    if (!habitId) { // Check for habitId, not habitTitle
      setError("No habit selected.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, range }), // Send habitId and range
      });

      if (!res.ok) {
          const errorData = await res.json(); // Attempt to get error message
          throw new Error(errorData.error || "Failed to fetch AI suggestion");
      }

      const data = await res.json();
      setSuggestion(data.suggestion || "No suggestion available.");
    } catch (err: any) { // Use 'any' type for error
      setError(err.message || "Error fetching suggestion. Please try again."); // Access err.message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
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
    </div>
  );
};

const FormattedSuggestion: React.FC<{ text: string }> = ({ text }) => {
    const sections = text.split("\n").filter((line) => line.trim() !== "");
  
    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-700">🧠 AI Suggestions</h3>
        <div className="mt-2 space-y-3">
          {sections.map((line, index) => {
            if (/^\*\*.*\*\*$/.test(line)) {
              // Format headings like **Specific**
              return (
                <h4 key={index} className="text-md font-bold text-blue-600 mt-4">
                  {line.replace(/\*\*/g, "")}
                </h4>
              );
            } else if (/^\*/.test(line) || /^-/.test(line)) {
              // Format bullet points
              return (
                <li key={index} className="list-disc list-inside text-gray-700">
                  {line.replace(/^\* |^- /, "")}
                </li>
              );
            } else {
              // Format normal paragraphs
              return <p key={index} className="text-gray-700">{line}</p>;
            }
          })}
        </div>
      </div>
    );
  };

export default ProcessAI;