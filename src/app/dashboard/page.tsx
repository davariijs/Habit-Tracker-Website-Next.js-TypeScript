import authConfig from '@/lib/auth.config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  try {
    let session = await getServerSession(authConfig);

    if (!session?.user) {
      return redirect('/');
    }
  } catch (error) {
  } finally {
    let session = await getServerSession(authConfig);
    if (session?.user) {
      redirect('/dashboard/habits');
    }
  }
}