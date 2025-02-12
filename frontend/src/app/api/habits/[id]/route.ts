// app/api/habits/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel, { IHabit } from '@/models/Habit';

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

// You could also add a GET route here to fetch a single habit by ID if needed