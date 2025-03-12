import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectMongo from "@/utils/db";
import { ObjectId } from "mongodb";
import Habit from "../../../models/Habit";

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

    const analysisStartDate = getAnalysisStartDate(habit);
    const aggregatedProgress = aggregateCompletions(habit, analysisStartDate, range);
    const geminiPrompt = formatDataForGemini(habit, aggregatedProgress, range);

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ suggestion: text });

  } catch (error) {
    console.error("Error in AI route:", error);
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  }
}



function getAnalysisStartDate(habit: any): Date {
  const now = new Date();
  const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));
  const startOfLastWeek = new Date(Date.UTC(startOfWeek.getUTCFullYear(), startOfWeek.getUTCMonth(), startOfWeek.getUTCDate() - 7));
  const habitStartDate = new Date(habit.startDate);
  const habitStartUTC = new Date(Date.UTC(habitStartDate.getUTCFullYear(), habitStartDate.getUTCMonth(), habitStartDate.getUTCDate()));
  return habitStartUTC >= startOfWeek ? habitStartUTC : startOfLastWeek;
}

function aggregateCompletions(habit: any, startDate: Date, range: string) {
  const filteredCompletions = habit.completions.filter((completion: any) => {
    const completionDate = new Date(completion.date);
    const completionDateUTC = new Date(Date.UTC(completionDate.getUTCFullYear(), completionDate.getUTCMonth(), completionDate.getUTCDate()));
    return completionDateUTC >= startDate;
  });

  const groupedCompletions: { [key: string]: number } = {};
  for (const completion of filteredCompletions) {
    if (completion.completed) {
      const completionDate = new Date(completion.date);
      const completionDateUTC = new Date(Date.UTC(completionDate.getUTCFullYear(), completionDate.getUTCMonth(), completionDate.getUTCDate()));
      let timeKey: string;

      switch (range) {
        case 'week':
          timeKey = getWeekKey(completionDateUTC);
          break;
        case 'month':
          timeKey = getMonthKey(completionDateUTC);
          break;
        case 'year':
          timeKey = getYearKey(completionDateUTC);
          break;
        default:
          throw new Error("Invalid range");
      }
      groupedCompletions[timeKey] = (groupedCompletions[timeKey] || 0) + 1;
    }
  }

  const aggregatedData = Object.entries(groupedCompletions).map(([time, completed]) => ({
    time,
    completed,
  }));

  aggregatedData.sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  return aggregatedData;
}


function getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function getDateFromWeekKey(weekKey: string): Date {
    const [yearStr, weekStr] = weekKey.split('-W');
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    const jan4th = new Date(Date.UTC(year, 0, 4));
    const thursdayOfFirstWeek = new Date(Date.UTC(jan4th.getUTCFullYear(), 0, 4 + (4 - (jan4th.getUTCDay() ||7))));

    const startOfWeek = new Date(thursdayOfFirstWeek.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 3);

    return startOfWeek;
}


function getMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function getYearKey(date: Date): string {
  return `${date.getUTCFullYear()}-01-01`;
}

function formatDataForGemini(habit: any, aggregatedProgress: any[], range: string) {
  let prompt = `Analyze the following habit data for "${habit.name}" and provide weekly suggestions for improvement. Only consider data from the current week and the previous week. If the habit was started this week, only consider data from the current week.\n\n`;
  prompt += `Habit Description: ${habit.question || 'No description provided.'}\n\n`;
  prompt += `Performance Data (grouped by ${range}):\n`;

  for (const dataPoint of aggregatedProgress) {
    if (range === 'week') {
      const weekStartDate = getDateFromWeekKey(dataPoint.time);
      const formattedDate = `${weekStartDate.getUTCFullYear()}-${String(weekStartDate.getUTCMonth() + 1).padStart(2, '0')}-${String(weekStartDate.getUTCDate()).padStart(2, '0')}`;
      prompt += `- Week of ${formattedDate}: Completed ${dataPoint.completed} times\n`;
    } else {
      prompt += `- ${dataPoint.time}: Completed ${dataPoint.completed} times\n`;
    }
  }

  prompt += "\nProvide specific, actionable suggestions for each week to help the user improve their habit consistency and achieve their goals. Consider trends in the data. If performance is declining, suggest ways to get back on track. If performance is good, suggest ways to maintain or further improve. Format suggestions as follows:\n\n**Week of [Date]:**\n* Suggestion 1\n* Suggestion 2\n* Suggestion 3"; // Corrected prompt
  if (aggregatedProgress.length > 0 && new Date(aggregatedProgress[0].time) >= new Date(habit.startDate)) {
      prompt += "\n\nNote: This is the first week of this habit. Suggestions are based on initial performance.";
  }

  return prompt;

}