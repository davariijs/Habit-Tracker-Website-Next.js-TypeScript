import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';
import { isSameDay } from 'date-fns';
import { scheduleNotifications } from '@/utils/notification/notificationScheduler';
import { convertToUtc } from '@/utils/notification/time';
interface HabitWithTimezoneOffset extends Omit<IHabit, '_id'> {
  userTimezoneOffset: number;
}


export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const habits = await HabitModel.find({ userId });
    
    console.log("📌 Retrieved Habits:", habits); // Log stored habits

    return NextResponse.json({ habits }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const requestData: HabitWithTimezoneOffset = await request.json();
    const { userTimezoneOffset, ...habitData } = requestData;

    if (!habitData.userId || !habitData.name || !habitData.color || !habitData.question || !habitData.frequencyType || !habitData.reminderTime) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    console.log("Received timezone offset:", userTimezoneOffset);
    console.log("Before conversion:", habitData.reminderTime);
    habitData.reminderTime = convertToUtc(habitData.reminderTime, userTimezoneOffset);
    console.log("After conversion:", habitData.reminderTime);

    
    const newHabit = new HabitModel(habitData);
    await newHabit.save();

    return NextResponse.json({ habit: newHabit }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to create habit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongo();
    const { id, date, completed } = await request.json();
    if (!id || !date) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    const formattedDate = new Date(date);

    const habit = await HabitModel.findById(id);
    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    const existingCompletionIndex = habit.completions.findIndex(comp => isSameDay(comp.date, formattedDate));

    if (existingCompletionIndex > -1) {
      habit.completions[existingCompletionIndex].completed = completed;
    } else {
      habit.completions.push({ date: formattedDate, completed });
    }

    await habit.save();
    return NextResponse.json({ habit }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing habit ID' }, { status: 400 });
    }

    const deletedHabit = await HabitModel.findByIdAndDelete(id);

    if (!deletedHabit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Habit deleted' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to delete habit' }, { status: 500 });
  }
}