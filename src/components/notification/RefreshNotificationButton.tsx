// components/RefreshNotificationButton.tsx
'use client';
import { refreshPushSubscription } from '@/utils/notification/refreshSubscription';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function RefreshNotificationButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session } = useSession();
  const userEmail = session?.user?.email as string;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage('');
    
    try {
      const result = await refreshPushSubscription(userEmail);
      if (result) {
        setMessage('Notifications refreshed successfully!');
      } else {
        setMessage('Could not refresh notifications. Check browser permissions.');
      }
    } catch (error) {
      setMessage('Failed to refresh notifications: ' + error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Notifications'}
      </button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}