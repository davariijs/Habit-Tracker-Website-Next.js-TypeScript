import { SearchParams } from 'nuqs/server';
import AllHabits from '@/components/habits/AllHabits';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata = {
  title: 'Dashboard : Habits'
};

export default async function Page({ searchParams }: pageProps) {
  return <AllHabits />;
}
