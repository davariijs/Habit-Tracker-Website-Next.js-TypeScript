import authConfig from '@/lib/auth.config';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function welcome() {
  try {
    const session = await getServerSession(authConfig);
    console.log('Session:', session); // Log the session to see its structure

    if (!session?.user) {
      return redirect('/');
    } else {
      return <div>welcome</div>;
    }
  } catch (error) {
    console.error('welcome page error:', error);
    // Handle or log the error appropriately
  }
}
