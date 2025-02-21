'use client';

import { useEffect, useState } from 'react';
import HabitHistoryChart from './HabitHistoryChart';
import HabitScoreChart from './HabitScoreChart';
import { Heading } from '../ui/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';


interface HabitDetailProps {
  habitId: string;
  habitColor: string;
}

const HabitCharts: React.FC<HabitDetailProps> = ({ habitId,habitColor}) => {
  const [habit, setHabit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const rangeOptions = ['day', 'week', 'month', 'year'];
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
    <div className='flex flex-1 flex-col space-y-5 px-6'>
      <div className='flex items-start justify-between py-3'>
            <Heading
            title='Habit Progress'
            description=''
            />
      </div>

      <div className='flex items-center space-x-2'>
              <p className='whitespace-nowrap text-sm font-medium'>
                Show by
              </p>
              <Select
                value={range}
                onValueChange={(value) => setRange(value as 'day' | 'week' | 'month' | 'year')}
              >
                <SelectTrigger className='h-8 w-[150px]' style={{color:habitColor}}>
                <SelectValue>{range}</SelectValue>
                </SelectTrigger>
                <SelectContent side='top'>
                  {rangeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>

      <HabitScoreChart habitId={habitId} range={range} habitColor={habitColor}/>
      {range !== 'day' && <HabitHistoryChart habitId={habitId} range={range as 'week' | 'month' | 'year'} habitColor={habitColor}/>}
    </div>
  );
};

export default HabitCharts;