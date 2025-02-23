"use client";

interface HabitTitleProps {
    habitId: string; // Add habitId prop
    range: 'week' | 'month' | 'year'; // Add range prop
}


import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import '@tensorflow/tfjs-backend-webgl'; // Import the WebGL backend!
// Import a pre-trained sentiment analysis model (e.g., from tfhub.dev)
import * as use from "@tensorflow-models/universal-sentence-encoder";

const ProcessAI: React.FC<HabitTitleProps> = ({ habitId, range }) => { // Use habitId and range
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<number | null>(null); // Add sentiment state
  const [model, setModel] = useState<use.UniversalSentenceEncoder | null>(null); // Add model state

  // Load the model only once when the component mounts
  useEffect(() => {
    const loadModelAndSetBackend = async () => {
      try {
        // Try to set the WebGL backend
        await tf.setBackend('webgl');
        console.log("Using WebGL backend");
      } catch (error) {
        console.warn("WebGL backend not available, falling back to CPU.");
        await tf.setBackend('cpu'); // Fallback to CPU
      }
  
      try {
        const loadedModel = await use.load();
        setModel(loadedModel);
      } catch (err) {
        console.error("Error loading the model:", err);
      }
    };
    loadModelAndSetBackend();
  }, []);


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

  const analyzeSentiment = async (text: string) => {
    if (!model) {
        console.warn("Sentiment model not loaded yet.");
        return;
    }

    setLoading(true);
    try {
        const embeddings = await model.embed(text);
        // The Universal Sentence Encoder returns embeddings, not direct sentiment.
        // You'll need a simple classifier on top.  For a quick demo, we'll
        // just use the first element of the embedding as a *proxy* for sentiment.
        // In a real application, you'd train a separate classifier.
        const sentimentScore = (await embeddings.data())[0];
        setSentiment(sentimentScore);
    } catch (err) {
        console.error("Error analyzing sentiment:", err);
    } finally {
        setLoading(false);
    }
};
// get habit title
useEffect(() => {
  const fetchHabitTitle = async () => {
    if (!habitId) return;
    try {
      const res = await fetch(`/api/habits/${habitId}`); // Replace with your actual API endpoint
      
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        if (data && data.title) { // Assuming your API returns the title in a 'title' field
          analyzeSentiment(data.title);
        }
      } else {
        console.error("Failed to fetch habit title");
      }
    } catch (error) {
      console.error("Error fetching habit title:", error);
    }
  };

  fetchHabitTitle();
}, [habitId, model]); // Depend on habitId and model

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

      {/* Display the sentiment score */}
      {sentiment !== null && (
                <p className="mt-2">
                    Sentiment Score: {sentiment.toFixed(2)} (Higher is more positive)
                </p>
            )}
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
            if (line.startsWith("**") && line.includes(":** ")) { // Changed split delimiter to "**: "
              const parts = line.split(":** "); // Changed split delimiter to "**: "
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
              // Format headings like **Specific** (if still needed)
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