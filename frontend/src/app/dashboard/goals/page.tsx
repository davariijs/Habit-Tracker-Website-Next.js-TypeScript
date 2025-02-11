import { SearchParams } from 'nuqs/server';
import ProfileViewPage from '@/features/profile/components/profile-view-page';
import Goals from '@/components/goal/goals';

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata = {
  title: 'Dashboard : Goals'
};

export default async function Page({ searchParams }: pageProps) {
  return <Goals />;
}