// app/api/habits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';
import mongoose from 'mongoose';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectMongo();
    const habitId = params.id;
    const updatedData: Partial<IHabit> = await request.json();

    if (!habitId) {
      return NextResponse.json({ message: 'Missing habit ID' }, { status: 400 });
    }

    const updatedHabit = await HabitModel.findByIdAndUpdate(habitId, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure data validation
    });

    if (!updatedHabit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ habit: updatedHabit }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to update habit' }, { status: 500 });
  }
}


export async function GET(req: Request, { params }: { params: { habitId: string } }) {
  await connectMongo();
  const { habitId } = params;

  try {
    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
    }

    const habit = await HabitModel.findById(new mongoose.Types.ObjectId(habitId));
    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}