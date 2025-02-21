import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import HabitCharts from '@/components/chartsProgress/HabitCharts';


interface HabitPageProps {
    params: { habitId: string };
    searchParams: { color?: string };
  }

  export const metadata = {
    title: 'Dashboard : Habit'
  };
  
  

const HabitPage = ({ params, searchParams }: HabitPageProps) => {
    if (!params.habitId) return notFound();

    const habitColor = searchParams.color || '#8884d8'; // Default color if not provided

  return (
    <div>
      <Suspense fallback={<p>Loading...</p>}>
        <HabitCharts habitId={params.habitId} habitColor={habitColor}/>
      </Suspense>
    </div>
  );
};

export default HabitPage;