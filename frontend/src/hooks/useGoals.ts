import useSWR from 'swr';

export type Goal = {
    _id: string;
    userId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  };


export function useGoals(userId: string | null) {
  const { data, error, mutate } = useSWR<Goal[]>(
    userId ? '/api/goals' : null, // Only fetch if userId is available
    userId ? (url: string) => fetch(url, { headers: { 'x-user-id': userId } }).then(res => res.json()) : null, // Inline fetcher
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const addGoal = async (goal: Omit<Goal, '_id' | 'userId'>) => {
    if (!userId) throw new Error("User not authenticated");

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId, // Include userId in headers
      },
      body: JSON.stringify({ ...goal, userId }), // Include userId in the body
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to add goal');
    }
    // No need to fetch the new goal, SWR will handle revalidation
    mutate(); // Revalidate and update cache
    //  return newGoal; // You can return it if you need it immediately, but mutate() is enough
  };

  const editGoal = async (updatedGoal: Goal) => {
    if (!userId) throw new Error("User not authenticated");

    const res = await fetch(`/api/goals/${updatedGoal._id}`, { // Use the correct URL with ID
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId, // Include userId in headers
      },
      body: JSON.stringify(updatedGoal),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to update goal');
    }
    // const goal = await res.json(); // No need to fetch, SWR will revalidate
    mutate(); // Revalidate and update cache
    // return goal;
  };

  const deleteGoal = async (id: string) => {
    if (!userId) throw new Error("User not authenticated");

    const res = await fetch(`/api/goals/${id}`, { // Use the correct URL with ID
      method: 'DELETE',
      headers: {
        'x-user-id': userId, // Include userId in headers
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to delete goal');
    }
    mutate(); // Revalidate and update cache
  };

  return {
    goals: data,
    isLoading: !error && !data,
    isError: error,
    addGoal,
    editGoal,
    deleteGoal,
  };
}