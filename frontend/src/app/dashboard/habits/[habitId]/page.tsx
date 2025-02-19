import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import HabitCharts from '@/components/chartsProgress/HabitCharts';


interface HabitPageProps {
    params: { habitId: string };
  }

const HabitPage = ({ params }: HabitPageProps) => {
    if (!params.habitId) return notFound();
  return (
    <div>
      <h2>Habit Progress</h2>
      <Suspense fallback={<p>Loading...</p>}>
        <HabitCharts habitId={params.habitId} />
      </Suspense>
    </div>
  );
};

export default HabitPage;