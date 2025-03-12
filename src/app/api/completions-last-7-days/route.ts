import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import Habit from "@/models/Habit";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get("habitId");
    const dateParam = searchParams.get("date");

    if (!habitId || !dateParam) {
      return NextResponse.json({ error: "Missing habitId or date" }, { status: 400 });
    }

    if (!ObjectId.isValid(habitId)) {
      return NextResponse.json({ error: "Invalid habit ID" }, { status: 400 });
    }

    await connectMongo();

    const habit = await Habit.findById(habitId);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }


    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 7); 

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