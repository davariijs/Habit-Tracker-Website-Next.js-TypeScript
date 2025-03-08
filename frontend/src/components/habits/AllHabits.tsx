'use client';
import React, { useState } from 'react';
import HabitForm from './HabitForm';
import HabitList from './HabitList';
import {Box} from '@mui/material';
import { createHabit,updateHabit } from '@/lib/habitapi';
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
    const [editingHabit, setEditingHabit] = useState<IHabit | null>(null);
    const { data: session } = useSession();
    const uid = session?.user.id || '';
    const userId = uid;
  
    const { mutate } = useSWR(`/api/habits?userId=${userId}`);
  
    const handleCreateHabit = async (habitData: HabitFormData) => {
      try {
        await createHabit(habitData);
        mutate();
        setShowForm(false);
        setEditingHabit(null);
        toast.success( 'Habit created successfully!');
      } catch (error) {
        console.error('Failed to create habit:', error);
        toast.error('An error occurred while submitting the habit.');
      }
    };
  
    const handleUpdateHabit = async (habitData: HabitFormData) => {
      if (!editingHabit) return;
  
      try {
        await updateHabit(editingHabit._id as string, habitData);
        mutate();
        setShowForm(false);
        setEditingHabit(null);
        toast.success('Habit updated successfully!');
      } catch (error) {
        console.error('Failed to update habit:', error);
        toast.error('An error occurred while submitting the habit.');
      }
    };
  
    const handleEditHabit = (habit: IHabit) => {
      setEditingHabit(habit);
      setShowForm(true);
    };
  
    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4 md:pl-10 pl-0'>
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
                setEditingHabit(null);
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
              onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
              initialData={editingHabit}
              userId={userId}
            />
          )}
          <HabitList userId={userId} onEditHabit={handleEditHabit} />
        </div>
        </PageContainer>
    );
  };

  export default AllHabits;