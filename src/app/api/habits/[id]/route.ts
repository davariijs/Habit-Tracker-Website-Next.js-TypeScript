import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';
import mongoose from 'mongoose';
import { clearSentNotification } from "@/utils/notification/pushNotificationService"; 
// Remove the schedule import

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { 
  try {
    await connectMongo();
    const habitId = (await params).id;
    const updatedData: Partial<IHabit> = await request.json();

    if (!habitId) {
      return NextResponse.json({ message: 'Missing habit ID' }, { status: 400 });
    }

    const existingHabit = await HabitModel.findById(habitId);
    if (!existingHabit) {
      return NextResponse.json({ message: "Habit not found" }, { status: 404 });
    }

    // Remove this block - node-schedule won't work in Vercel
    // if (schedule.scheduledJobs[habitId]) {
    //   schedule.scheduledJobs[habitId].cancel();
    // }

    const updatedHabit = await HabitModel.findByIdAndUpdate(habitId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHabit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    // Still clear sent notification logs - this is still useful
    clearSentNotification(habitId);

    // This doesn't actually schedule anything anymore, but keeping for compatibility
    // await scheduleNotifications();

    return NextResponse.json({ habit: updatedHabit }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to update habit' }, { status: 500 });
  }
}


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectMongo();
  const habitId = (await params).id;

  try {
    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
    }

    const habit = await HabitModel.findById(habitId);
    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({title: habit.name});
  } catch (error) {
    console.error("Error fetching habit:", error);
    return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
  }
}