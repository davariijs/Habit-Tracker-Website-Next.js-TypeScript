import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import Habit from "@/models/Habit";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    // Extract habitId and date from query parameters
    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get("habitId");
    const dateParam = searchParams.get("date");

    if (!habitId || !dateParam) {
      return NextResponse.json({ error: "Missing habitId or date" }, { status: 400 });
    }

    if (!ObjectId.isValid(habitId)) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    // Connect to MongoDB
    await connectMongo();

    // Find the habit by ID
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Convert date string to Date object
    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Calculate the date range for the last 7 days
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 7); // Go back 7 days

    // Filter completions from the last 7 days
    const completionsLast7Days = habit.completions.filter((completion: any) => {
      const completionDate = new Date(completion.date);
      return completion.completed && completionDate >= startDate && completionDate <= targetDate;
    }).length;

    return NextResponse.json({ completions: completionsLast7Days });

  } catch (error) {
    console.error("Error fetching completions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}