import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import HabitCharts from '@/components/chartsProgress/HabitCharts';
import { CircularProgress } from '@mui/material';


interface HabitPageProps {
  params: Promise<{ habitId: string }>;
  searchParams: Promise<{ color?: string, title?: string }>;
}

  export const metadata = {
    title: 'Dashboard : Habit'
  };
  
  

const HabitPage =async ({ params, searchParams }: HabitPageProps) => {
    const { habitId } = await params;
    if (!habitId) return notFound();
    const { color, title } = await searchParams;

    const habitColor = color || '#8884d8';
    const habitTitle = title || 'How do I not lose my motivation to pursue my goals?';

  return (
    <div>
      <Suspense fallback={<div className='flex justify-center items-center mt-40'><CircularProgress /></div>}>
        <HabitCharts habitId={habitId} habitColor={habitColor} habitTitle={habitTitle}/>
      </Suspense>
    </div>
  );
};

export default HabitPage;