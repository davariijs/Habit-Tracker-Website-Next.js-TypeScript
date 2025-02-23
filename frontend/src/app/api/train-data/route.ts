
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import Habit from "@/models/Habit"; // Your Habit model
import { ObjectId } from "mongodb";
import mongoose, { Document } from 'mongoose';


export interface IHabit extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  userEmail:string;
  name: string;
  color: string;
  question: string;
  frequencyType: 'everyday' | 'everyXDays' | 'XTimesPerWeek' | 'XTimesPerMonth' | 'XTimesInXDays';
  frequencyValue: number;
  frequencyValue2?: number;
  reminderTime?: string;
  startDate: Date;
  completions: { date: Date; completed: boolean }[];
}

interface TrainingDataFeatures {
    dayOfWeek: number[];
    completionsLast7Days: number;
    completed: number;
    // Add other features here as you add them
  }

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const habitId = searchParams.get('habitId');

    if (!habitId || !ObjectId.isValid(habitId)) {
      return NextResponse.json({ error: "Invalid or missing habit ID" }, { status: 400 });
    }

    const habit = await Habit.findById(habitId);
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const trainingData = prepareTrainingData(habit);

    return NextResponse.json({ data: trainingData });
  } catch (error) {
    console.error("Error in train-data route:", error);
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  }
}

function prepareTrainingData(habit: IHabit) {
  const trainingData = [];

  // Iterate over the habit's completion history
  for (const completion of habit.completions) {
    const completionDate = new Date(completion.date);
    const features: TrainingDataFeatures = {} as TrainingDataFeatures;

    // 1. Day of the Week (One-Hot Encoding)
    const dayOfWeek = completionDate.getDay(); // 0 (Sunday) to 6 (Saturday)
    const dayOfWeekEncoded = Array(7).fill(0);
    dayOfWeekEncoded[dayOfWeek] = 1;
    features.dayOfWeek = dayOfWeekEncoded;

    // 2. Past Completion History (Example: Completions in last 7 days)
    let completionsLast7Days = 0;
    const sevenDaysAgo = new Date(completionDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    for (const pastCompletion of habit.completions) {
      const pastCompletionDate = new Date(pastCompletion.date);
      if (pastCompletionDate >= sevenDaysAgo && pastCompletionDate < completionDate) {
        completionsLast7Days++;
      }
    }
    features.completionsLast7Days = completionsLast7Days;

    // 3. Target Variable (Completed or Not)
    features.completed = 1; // Since we're iterating over *completed* entries

    trainingData.push(features);
  }

  // Create data points for *non-completed* days as well.  This is important!
  const startDate = new Date(habit.startDate);
  const today = new Date();

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Check if this date exists in the completions
      const completionExists = habit.completions.some((completion: any) => {
          return new Date(completion.date).toISOString().split('T')[0] === dateString;
      });

      if (!completionExists) {
          const features: any = {};

          // Day of the Week
          const dayOfWeek = d.getDay();
          const dayOfWeekEncoded = Array(7).fill(0);
          dayOfWeekEncoded[dayOfWeek] = 1;
          features.dayOfWeek = dayOfWeekEncoded;

          // Completions in last 7 days
          let completionsLast7Days = 0;
          const sevenDaysAgo = new Date(d);
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          for (const pastCompletion of habit.completions) {
              const pastCompletionDate = new Date(pastCompletion.date);
              if (pastCompletionDate >= sevenDaysAgo && pastCompletionDate < d) {
                  completionsLast7Days++;
              }
          }
          features.completionsLast7Days = completionsLast7Days;

          // Target Variable (Not Completed)
          features.completed = 0;

          trainingData.push(features);
      }
  }

  return trainingData;
}