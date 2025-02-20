'use client';

import { useEffect, useState } from 'react';
import HabitHistoryChart from './HabitHistoryChart';
import HabitScoreChart from './HabitScoreChart';

interface HabitDetailProps {
  habitId: string;
  habitColor: string;
}

const HabitCharts: React.FC<HabitDetailProps> = ({ habitId,habitColor}) => {
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (!habitId) return;

    const fetchHabit = async () => {
      try {
        const res = await fetch(`/api/progress/${habitId}/${range}`);
        if (!res.ok) throw new Error('Habit not found');

        const data = await res.json();
        setHabit(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [habitId]);

  if (loading) return <p>Loading...</p>;
  if (!habit) return <p>Habit not found</p>;

  return (
    <div>
      <select onChange={(e) => setRange(e.target.value as 'day' | 'week' | 'month' | 'year')} value={range}>
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>

      <HabitScoreChart habitId={habitId} range={range} habitColor={habitColor}/>
      {range !== 'day' && <HabitHistoryChart habitId={habitId} range={range as 'week' | 'month' | 'year'} habitColor={habitColor}/>}
    </div>
  );
};

export default HabitCharts;