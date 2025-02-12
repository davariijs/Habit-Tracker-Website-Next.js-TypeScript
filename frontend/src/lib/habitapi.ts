
import { IHabit } from '@/models/Habit';
// --- IMPORTANT: Import HabitFormData ---
import { HabitFormData } from '@/components/habits/HabitForm';


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const createHabit = async (habitData: HabitFormData) => {
  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(habitData),
  });
  if (!response.ok) {
    throw new Error('Failed to create habit'); // Throw error for SWR to handle
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
    const response = await fetch(`/api/habits/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(habitData),
    });
    if (!response.ok) {
        throw new Error('Failed to update habit');
    }
    return response.json();
}

export { fetcher, createHabit, updateHabitCompletion, deleteHabit, updateHabit };