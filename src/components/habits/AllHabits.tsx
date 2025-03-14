'use client';
import React, { useState } from 'react';
import HabitForm from './HabitForm';
import HabitList from './HabitList';
import {Box} from '@mui/material';
import { createHabit, updateHabit } from '@/lib/habitapi';
import useSWR from 'swr';
import { HabitFormData } from './HabitForm';
import { useSession } from 'next-auth/react';
import { IHabit } from '@/models/Habit';
import PageContainer from '../layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

const AllHabits: React.FC = () => {
    const [showFormDialog, setShowFormDialog] = useState(false);
    const [editingHabit, setEditingHabit] = useState<IHabit | null>(null);
    const { data: session } = useSession();
    const uid = session?.user.id || '';
    const userId = uid;
  
    const { mutate } = useSWR(`/api/habits?userId=${userId}`);
  
    const handleCreateHabit = async (habitData: HabitFormData) => {
      try {
        await createHabit(habitData);
        mutate();
        setShowFormDialog(false);
        setEditingHabit(null);
        toast.success('Habit created successfully!');
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
        setShowFormDialog(false);
        setEditingHabit(null);
        toast.success('Habit updated successfully!');
      } catch (error) {
        console.error('Failed to update habit:', error);
        toast.error('An error occurred while submitting the habit.');
      }
    };
  
    const handleEditHabit = (habit: IHabit) => {
      setEditingHabit(habit);
      setShowFormDialog(true);
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
                  variant='default' 
                  size='lg'
                  onClick={() => {
                    setEditingHabit(null);
                    setShowFormDialog(true);
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Habit
                </Button>
              </Box>
            </div>
          </div>
    
          <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </DialogTitle>
                <DialogDescription>
                  {editingHabit 
                    ? 'Update your habit details below.' 
                    : 'Fill in the details to create a new habit.'}
                </DialogDescription>
              </DialogHeader>
              
              <HabitForm
                onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
                initialData={editingHabit}
                userId={userId}
                onCancel={() => setShowFormDialog(false)}
              />
            </DialogContent>
          </Dialog>
          
          <HabitList userId={userId} onEditHabit={handleEditHabit} />
        </div>
      </PageContainer>
    );
  };

  export default AllHabits;