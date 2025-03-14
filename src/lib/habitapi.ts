import { HabitFormData } from '@/components/habits/HabitForm';
import { refreshPushSubscription } from '@/utils/notification/refreshSubscription';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const createHabit = async (habitData: HabitFormData & { userTimezoneOffset?: number }) => {
  console.log("Creating habit with offset:", habitData.userTimezoneOffset);
  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habitData),
  });
  if (!response.ok) {
    throw new Error('Failed to create habit');
  }
  return response.json();
};

const updateHabitCompletion = async (id: string, date: Date, completed: boolean) => {
  const response = await fetch('/api/habits', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, date: date.toISOString(), completed }),
  });
  if (!response.ok) {
    throw new Error('Failed to update habit');
  }
  return response.json();
};

const deleteHabit = async (id: string) => {
    const response = await fetch(`/api/habits?id=${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete habit');
    }
    return response.json();
}

const updateHabit = async (id: string, habitData: HabitFormData) => {
  try {
      // First update the habit
      const response = await fetch(`/api/habits/${id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...habitData,
            userTimezoneOffset: new Date().getTimezoneOffset()
          }),
      });
      
      if (!response.ok) {
          throw new Error('Failed to update habit');
      }
      
      const data = await response.json();
      
      // Get user email
      const userEmail = habitData.userEmail;
      
      if (userEmail) {
          try {
              // Refresh subscription with email - wrapped in a try/catch so main function continues if this fails
              await refreshPushSubscription(userEmail);
              console.log('Push subscription refreshed successfully');
          } catch (error) {
              console.error('Error refreshing notification subscription:', error);
              // Log error but don't stop execution
          }
      }
      
      return data;
  } catch (error) {
      console.error('Error in updateHabit:', error);
      throw error;
  }
}


export { fetcher, createHabit, updateHabitCompletion, deleteHabit, updateHabit };