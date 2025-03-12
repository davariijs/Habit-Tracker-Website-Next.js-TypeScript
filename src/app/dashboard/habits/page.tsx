import { SearchParams } from 'nuqs/server';
import AllHabits from '@/components/habits/AllHabits';
import PageContainer from '@/components/layout/page-container';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata = {
  title: 'Dashboard : Habits'
};

export default async function Page({ searchParams }: pageProps) {
  return (
  <PageContainer scrollable>
  <AllHabits />
  </PageContainer>
  )
}
