'use client';
import React, { useState } from 'react';
import HabitForm from './HabitForm';
import HabitList from './HabitList';
import {Box} from '@mui/material';
import { createHabit,updateHabit } from '@/lib/habitapi'; // Import from api.ts
import useSWR from 'swr';
import { HabitFormData } from './HabitForm';
import { useSession } from 'next-auth/react';
import { IHabit } from '@/models/Habit';
import PageContainer from '../layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AllHabits: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingHabit, setEditingHabit] = useState<IHabit | null>(null); // State for tracking the habit being edited
    const { data: session } = useSession();
    const uid = session?.user.id || '';
    const userId = uid;
  
    const { mutate } = useSWR(`/api/habits?userId=${userId}`);
  
    const handleCreateHabit = async (habitData: HabitFormData) => {
      try {
        await createHabit(habitData);
        mutate(); // Refresh the habit list
        setShowForm(false);
        setEditingHabit(null);
        toast.success( 'Habit created successfully!');
      } catch (error) {
        console.error('Failed to create habit:', error);
        toast.error('An error occurred while submitting the habit.');
      }
    };
  
    const handleUpdateHabit = async (habitData: HabitFormData) => {
      if (!editingHabit) return; // Ensure there's a habit being edited
  
      try {
        await updateHabit(editingHabit._id as string, habitData); // Use updateHabit API
        mutate(); // Refresh the habit list
        setShowForm(false);
        setEditingHabit(null);
        toast.success('Habit updated successfully!');
      } catch (error) {
        console.error('Failed to update habit:', error);
        toast.error('An error occurred while submitting the habit.');
      }
    };
  
    const handleEditHabit = (habit: IHabit) => {
      setEditingHabit(habit); // Set the habit to be edited
      setShowForm(true); // Show the form
    };
  
    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
          <div>
            <Heading
              title='Habit Tracker'
              description=''
            />
          </div>
          
          <div>
          <Box>
            <Button
              variant='default' size='lg'
              className=''
              onClick={() => {
                setShowForm(!showForm);
                setEditingHabit(null); // Reset editing state for "create habit"
              }}
            >
              <Plus className='mr-2 h-4 w-4' />
              {showForm ? 'Hide Form' : 'Add Habit'}
            </Button>
          </Box>
          </div>
          </div>
    
          {showForm && (
            <HabitForm
              onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit} // Different handler for create vs update
              initialData={editingHabit} // Pass the habit being edited (or null for create)
              userId={userId}
            />
          )}
          <HabitList userId={userId} onEditHabit={handleEditHabit} /> {/* Pass handleEditHabit */}
        </div>
        </PageContainer>
    );
  };

  export default AllHabits;