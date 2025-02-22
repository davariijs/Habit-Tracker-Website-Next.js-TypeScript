import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import HabitCharts from '@/components/chartsProgress/HabitCharts';


interface HabitPageProps {
    params: { habitId: string };
    searchParams: { color?: string,title?:string };
  }

  export const metadata = {
    title: 'Dashboard : Habit'
  };
  
  

const HabitPage = ({ params, searchParams }: HabitPageProps) => {
    if (!params.habitId) return notFound();

    const habitColor = searchParams.color || '#8884d8';
    const habitTitle = searchParams.title || 'How do I not lose my motivation to pursue my goals?';

  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <HabitCharts habitId={params.habitId} habitColor={habitColor} habitTitle={habitTitle}/>
      </Suspense>
    </div>
  );
};

export default HabitPage;