import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';
import { isSameDay } from 'date-fns';
import { scheduleNotifications } from '@/utils/notification/notificationScheduler';

export async function GET(request: NextRequest) {
  try {
    await connectMongo();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Get userId from query parameter

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    const habits = await HabitModel.find({ userId }); // Filter by userId
    return NextResponse.json({ habits }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const habitData: Omit<IHabit, '_id'> = await request.json();

    // Basic validation (add more as needed)
    if (!habitData.userId || !habitData.name || !habitData.color || !habitData.question || !habitData.frequencyType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newHabit = new HabitModel(habitData);
    await newHabit.save();
    console.log(`✅ New habit "${habitData.name}" saved!`);

    // ✅ Restart the scheduler to include the new habit
    await scheduleNotifications();

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