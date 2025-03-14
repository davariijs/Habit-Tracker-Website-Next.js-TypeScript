import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';
import mongoose from 'mongoose';
import { clearSentNotification } from "@/utils/notification/pushNotificationService"; 
import { convertToUtc, formatTime }from '@/utils/notification/time';

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

    // Convert reminderTime to UTC before saving
    if (updatedData.reminderTime) {
      const userTimezoneOffset = new Date().getTimezoneOffset();
      updatedData.reminderTime = convertToUtc(updatedData.reminderTime, userTimezoneOffset);
    }

    const updatedHabit = await HabitModel.findByIdAndUpdate(habitId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHabit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    // 🛑 Clear old notification logs so a fresh notification can be sent
    await clearSentNotification(habitId);

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