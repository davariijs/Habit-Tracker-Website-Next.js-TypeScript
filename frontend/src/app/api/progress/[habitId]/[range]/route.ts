import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/utils/db';
import HabitModel from '@/models/Habit';
import mongoose from 'mongoose';
import {
  format,
  subDays,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval
} from 'date-fns';

interface Completion {
  date: string;
  completed: boolean;
}

interface Habit {
  _id: string;
  completions: Completion[];
}

export async function GET(req: NextRequest,   { params }: { params: Promise<{ habitId: string; range: string }> }) {
  await connectMongo();
  const { habitId, range } = await params;

  try {
    if (!mongoose.Types.ObjectId.isValid(habitId)) {
      return NextResponse.json({ message: 'Invalid habit ID' }, { status: 400 });
    }

    const habit = await HabitModel.findById(new mongoose.Types.ObjectId(habitId)) as unknown as Habit;

    if (!habit) {
      return NextResponse.json({ message: 'Habit not found' }, { status: 404 });
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let interval: Date[];

    if (range === 'day') {
      // ✅ Show last 7 days
      startDate = subDays(now, 6);
      endDate = now;
      interval = eachDayOfInterval({ start: startDate, end: endDate });
    } else if (range === 'week') {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      interval = eachWeekOfInterval({ start: startDate, end: endDate });
    } else if (range === 'month') {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      interval = eachMonthOfInterval({ start: startDate, end: endDate });
    } else if (range === 'year') {
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      interval = eachYearOfInterval({ start: startDate, end: endDate });
    } else {
      return NextResponse.json({ message: 'Invalid range' }, { status: 400 });
    }

    const historyData = interval.map(date => {
      const dateStart = range === 'year' ? startOfYear(date) : range === 'month' ? startOfMonth(date) : range === 'week' ? startOfWeek(date) : startOfDay(date);
      const dateEnd = range === 'year' ? endOfYear(date) : range === 'month' ? endOfMonth(date) : range === 'week' ? endOfWeek(date) : endOfDay(date);

      const completionsInInterval = habit.completions.filter(c => {
        const completionDate = new Date(c.date);
        return completionDate >= dateStart && completionDate <= dateEnd && c.completed;
      });

      let xLabel = '';
      if (range === 'day') {
        xLabel = format(dateStart, 'MMM dd'); // Example: "Feb 15"
      } else if (range === 'week') {
        xLabel = format(dateStart, 'MMM') === 'Jan' ? format(dateStart, 'MMM yyyy') : format(dateStart, 'MMM dd');
      } else if (range === 'month') {
        xLabel = format(dateStart, 'MMM') === 'Jan' ? format(dateStart, 'MMM yyyy') : format(dateStart, 'MMM');
      } else if (range === 'year') {
        xLabel = format(dateStart, 'yyyy');
      }

      return {
        time: xLabel,
        completed: completionsInInterval.length,
      };
    });

    return NextResponse.json({
      history: historyData,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}