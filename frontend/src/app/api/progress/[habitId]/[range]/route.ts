import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/utils/db';
import HabitModel from '@/models/Habit';

export async function GET(req: NextRequest, { params }: { params: { habitId: string; range: string } }) {
  await connectMongo();
  const { habitId, range } = params;

  try {
    // Convert habitId from string to ObjectId
    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
    }

    const habit = await HabitModel.findById(new mongoose.Types.ObjectId(habitId));
    
    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    const now = new Date();
    let startDate: Date;

    switch (range) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return NextResponse.json({ message: 'Invalid range' }, { status: 400 });
    }

    const completions = habit.completions.filter((c) => new Date(c.date) >= startDate);
    const completedCount = completions.filter((c) => c.completed).length;
    const totalDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const completionRate = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;

    let historyData: { time: string; completed: number }[] = [];
    if (range === 'week') {
      historyData = Array(7).fill(0).map((_, i) => ({
        time: `Day ${i + 1}`,
        completed: completions.filter((c) => new Date(c.date).getDay() === i).length,
      }));
    } else if (range === 'month') {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      historyData = Array(daysInMonth).fill(0).map((_, i) => ({
        time: `Day ${i + 1}`,
        completed: completions.filter((c) => new Date(c.date).getDate() === i + 1).length,
      }));
    } else if (range === 'year') {
      historyData = Array(12).fill(0).map((_, i) => ({
        time: `Month ${i + 1}`,
        completed: completions.filter((c) => new Date(c.date).getMonth() === i).length,
      }));
    }

    return NextResponse.json({
      score: completionRate.toFixed(2),
      history: historyData,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}