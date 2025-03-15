import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';
import mongoose from 'mongoose';
import { clearSentNotification } from "@/utils/notification/pushNotificationService"; 
import { convertToUtc, formatTime }from '@/utils/notification/time';
interface HabitUpdateWithTimezoneOffset extends Partial<IHabit> {
  userTimezoneOffset: number;
}


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { 
  try {
    await connectMongo();
    const habitId = (await params).id;
    const requestData: HabitUpdateWithTimezoneOffset = await request.json();
    const { userTimezoneOffset, ...updatedData } = requestData;

    if (!habitId) {
      return NextResponse.json({ message: 'Missing habit ID' }, { status: 400 });
    }

    const existingHabit = await HabitModel.findById(habitId);
    if (!existingHabit) {
      return NextResponse.json({ message: "Habit not found" }, { status: 404 });
    }

    console.log("Received timezone offset:", userTimezoneOffset);
    console.log("Before conversion:", updatedData.reminderTime);


    if (updatedData.reminderTime) {
      console.log(`Converting time for habit update "${existingHabit.name}"`);
      console.log(`Local time: ${updatedData.reminderTime}, Offset: ${userTimezoneOffset}`);
      
      const localReminderTime = updatedData.reminderTime;
      
      const utcReminderTime = convertToUtc(localReminderTime, userTimezoneOffset);
      console.log(`Converted UTC time: ${utcReminderTime}`);
      
      updatedData.reminderTime = localReminderTime;
      updatedData.reminderTimeUtc = utcReminderTime;
    }

    const updatedHabit = await HabitModel.findByIdAndUpdate(habitId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHabit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }
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