// app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectMongo from "@/utils/db";
import { ObjectId } from "mongodb";
import Habit from "../../../models/Habit"; // Import your Habit model

export async function POST(req: NextRequest) {
  try {
    const { habitId, range = 'week' } = await req.json();

    if (!habitId) {
      return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
    }
    if (!ObjectId.isValid(habitId)) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    await connectMongo();

    const habit = await Habit.findById(habitId);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Aggregate completions directly from the habit document
    const aggregatedProgress = aggregateCompletions(habit, range);

    const geminiPrompt = formatDataForGemini(habit, aggregatedProgress, range);

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ suggestion: text });

  } catch (error) {
    console.error("Error in AI route:", error);
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  }
}

// Helper function to aggregate completions from the habit's completions array
function aggregateCompletions(habit: any, range: string) {
  const now = new Date();
  let startDate: Date;

  switch (range) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      break;
    case 'month':
      startDate = new Date(now.setDate(1));
      break;
    case 'year':
      startDate = new Date(now.setMonth(0, 1));
      break;
    default:
      throw new Error("Invalid range");
  }
  startDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));

  // Filter completions within the date range
  const filteredCompletions = habit.completions.filter((completion: any) => {
    const completionDate = new Date(completion.date);
    return completionDate >= startDate;
  });

  // Group and count completions
  const groupedCompletions: { [key: string]: number } = {};
  for (const completion of filteredCompletions) {
    if (completion.completed) { // Only count completed entries
      const completionDate = new Date(completion.date);
      let timeKey: string;

      switch (range) {
        case 'week':
          timeKey = getWeekKey(completionDate);
          break;
        case 'month':
          timeKey = getMonthKey(completionDate);
          break;
        case 'year':
          timeKey = getYearKey(completionDate);
          break;
        default: // Should never happen due to earlier validation
          throw new Error("Invalid range");
      }
      groupedCompletions[timeKey] = (groupedCompletions[timeKey] || 0) + 1;
    }
  }

    // Convert to the desired format
    const aggregatedData = Object.entries(groupedCompletions).map(([time, completed]) => ({
        time,
        completed,
    }));

    //sort by date
    aggregatedData.sort((a, b) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
    });

    return aggregatedData;
}

// Helper functions to get consistent time keys (for grouping)
function getWeekKey(date: Date): string {
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - date.getDay()); // Start of the week
    return `${startDate.getUTCFullYear()}-${String(startDate.getUTCMonth() + 1).padStart(2, '0')}-${String(startDate.getUTCDate()).padStart(2, '0')}`;
}

function getMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function getYearKey(date: Date): string {
  return `${date.getUTCFullYear()}-01-01`;
}

// Helper function to format the data for Gemini (No changes needed)
function formatDataForGemini(habit: any, aggregatedProgress: any[], range: string) {
  let prompt = `Analyze the following habit data for "${habit.name}" and provide weekly suggestions for improvement.\n\n`; // Use habit.name
  prompt += `Habit Description: ${habit.question || 'No description provided.'}\n\n`; // Use habit.question
  prompt += `Performance Data (${range}):\n`;

  for (const dataPoint of aggregatedProgress) {
    prompt += `- ${dataPoint.time}: Completed ${dataPoint.completed} times\n`;
  }

  prompt += "\nProvide specific, actionable suggestions for each week to help the user improve their habit consistency and achieve their goals.  Consider trends in the data.  If performance is declining, suggest ways to get back on track. If performance is good, suggest ways to maintain or further improve.  Format suggestions as follows:\n\n**Week of [Date]:**\n* Suggestion 1\n* Suggestion 2\n* Suggestion 3";

  return prompt;
}