// app/api/progress/[habitId]/[range]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  connectMongo  from '@/utils/db'; // Assuming you have a db connection utility
import HabitModel from '@/models/Habit'; // Assuming you have a Habit model
import mongoose from 'mongoose';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval, isSameDay, isSameWeek, isSameMonth, isSameYear, getDaysInMonth } from 'date-fns';

interface Completion {
  date: string;
  completed: boolean;
}

interface Habit {
  _id: string;
  completions: Completion[];
  // ... other habit fields
}
export async function GET(req: NextRequest, { params }: { params: { habitId: string; range: string } }) {
  await connectMongo();
  const { habitId, range } = params;

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
    let endDate: Date = endOfDay(now); // Important: Include the current day
    let interval: Date[] = []; 

    switch (range) {
      case 'day':
        startDate = startOfDay(now);
        interval = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 }); // Or 1, depending on your preference
        endDate = endOfWeek(now, { weekStartsOn: 0 });
        interval = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        interval = eachDayOfInterval({ start: startDate, end: endDate });
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        interval = eachMonthOfInterval({ start: startDate, end: endDate });
        break;
      default:
        return NextResponse.json({ message: 'Invalid range' }, { status: 400 });
    }

    const historyData = interval.map(date => {
      const dateStart = (range === 'year') ? startOfMonth(date) : startOfDay(date); //start of month for year range
      const dateEnd = (range === 'year') ? endOfMonth(date) : endOfDay(date);     //end of month for year range
      const completionsInInterval = habit.completions.filter(c => {
        const completionDate = new Date(c.date);
        return completionDate >= dateStart && completionDate <= dateEnd && c.completed;
      });

      let xLabel = '';
      if (range === 'day' || range === 'week' || range === 'month') {
          xLabel = format(dateStart, 'yyyy-MM-dd');
      } else { // Year
          xLabel = format(dateStart, 'MMM'); // Format as "Jan", "Feb", etc.
      }

      return {
        time: xLabel,
        completed: completionsInInterval.length,
      };
    });

    // Calculate overall completion rate (for the Line Chart, if needed)
    const completedCount = habit.completions.filter(c => new Date(c.date) >= startDate && new Date(c.date) <= endDate && c.completed).length;
    const totalPossibleDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1; // +1 to include start date
    const completionRate = totalPossibleDays > 0 ? (completedCount / totalPossibleDays) * 100 : 0;


    return NextResponse.json({
      score: completionRate.toFixed(2), // For overall display (optional)
      history: historyData,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}