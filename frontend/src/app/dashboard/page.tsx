import NotificationHandler from '@/components/notification/NotificationHandler';
import authConfig from '@/lib/auth.config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  try {
    let session = await getServerSession(authConfig);
    console.log('Session:', session);

    if (!session?.user) {
      return redirect('/');
    }
  } catch (error) {
    console.error('Dashboard page error:', error);
  } finally {
    let session = await getServerSession(authConfig);
    if (session?.user) {
      redirect('/dashboard/overview');
    }
  }
}

// curl -X POST http://localhost:3000/api/notification/start-scheduler