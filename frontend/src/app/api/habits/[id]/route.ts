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


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectMongo();
  const { id } = params; // Use 'id' to match the filename [id]

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
    }

    const habit = await HabitModel.findById(id); // Pass id directly
    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({title: habit.name}); // Return the habit object
  } catch (error) {
    console.error("Error fetching habit:", error); // Log the error
    return NextResponse.json({ message: 'Server error', error: String(error) }, { status: 500 });
  }
}