"use client";

import React, {useState} from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { IHabit } from '@/models/Habit';
import useSWR from 'swr';
import { fetcher, updateHabitCompletion, deleteHabit } from '@/lib/habitapi';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HabitCalendar from './HabitCalendar';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface HabitListProps {
  userId: string;
  onEditHabit: (habit: IHabit) => void;
}

const HabitList: React.FC<HabitListProps> = ({ userId, onEditHabit }) => {
  const { data, error, isLoading, mutate } = useSWR(`/api/habits?userId=${userId}`, fetcher);
  const [visibleCalendar, setVisibleCalendar] = useState<string | null>(null);
  const { theme } = useTheme();
  const toggleCalendar = (habitId: string) => {
    setVisibleCalendar((prevId) => (prevId === habitId ? null : habitId));
  };


  const onToggleComplete = async (habitId: string, date: Date, completed: boolean) => {
    mutate(
      async (currentData: any) => {
        if (!currentData) return currentData;
        const updatedHabits = currentData.habits.map((h: IHabit) => {
          if (h._id === habitId) {
            const newCompletions = [...h.completions];
            const existingCompletionIndex = newCompletions.findIndex((comp) =>
              isSameDay(comp.date, date)
            );
            if (existingCompletionIndex > -1) {
              newCompletions[existingCompletionIndex].completed = completed;
            } else {
              newCompletions.push({ date, completed });
            }
            return { ...h, completions: newCompletions };
          }
          return h;
        });
        return { ...currentData, habits: updatedHabits };
      },
      false
    );

    try {
      await updateHabitCompletion(habitId, date, completed);
      // mutate(); // Don't revalidate immediately, do full refresh
      window.location.reload(); // Force page refresh
    } catch (err) {
      console.error(err);
      mutate();
    }
  };

  const onDeleteHabit = async (habitId: string) => {
    mutate(
      async (currentData: any) => {
        if (!currentData) return currentData;
        const updatedHabits = currentData.habits.filter((h: IHabit) => h._id !== habitId);
        return { ...currentData, habits: updatedHabits };
      },
      false
    );

    try {
      await deleteHabit(habitId);
      mutate();
    } catch (err) {
      console.error(err);
      mutate();
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <div>Failed to load habits</div>;
  if (!data) return <div>No habits found</div>;

  const habits: IHabit[] = data.habits;
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });


  return (
    <List>
      {habits.map((habit) => (
        <React.Fragment key={String(habit._id)}>
          <Card className='mb-8 p-3'>
          <ListItem>
          <Box sx={{ width: '100%' , cursor: 'pointer'}}>
            <ListItemText
              primary={habit.name}
              secondary={`${habit.question} - ${habit.frequencyType} ${
                habit.frequencyType === 'everyXDays'
                    ? `every ${habit.frequencyValue} days`
                    : habit.frequencyType === 'XTimesPerWeek'
                    ? `${habit.frequencyValue} times per week`
                    : habit.frequencyType === 'XTimesPerMonth'
                    ? `${habit.frequencyValue} times per month`
                    : habit.frequencyType === 'XTimesInXDays'
                    ? `${habit.frequencyValue} times in ${habit.frequencyValue2} days`
                    : '' // Handle other cases or provide a default
                }`}
              slotProps={{ primary: { style: { color: habit.color } },
              secondary: { style: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' } }
             }} // Use slotProps
            />
            <Box sx={{ marginTop:"20px"}} display="flex" justifyContent="center" alignItems="center" gap={1}>
                {daysOfWeek.map((day) => {
                    const completion = habit.completions.find((c) => isSameDay(c.date, day));
                    const isCompleted = completion ? completion.completed : false;

                    return (
                        <Box key={day.toISOString()} display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="caption">{format(day, 'EEE')}</Typography> {/* Day abbreviation */}
                            <Checkbox
                                checked={isCompleted}
                                onChange={() => onToggleComplete(String(habit._id), day, !isCompleted)}
                                sx={{
                                    color: habit.color,
                                    '&.Mui-checked': {
                                        color: habit.color,
                                    },
                                }}
                            />
                        </Box>
                    );
                })}
              </Box>
              <div className='flex justify-center my-3'>
                <IconButton
                    sx={{  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}}
                    edge="end"
                    aria-label="edit"
                    onClick={() => onEditHabit(habit)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton sx={{  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}} edge="end" aria-label="delete" onClick={() => onDeleteHabit(String(habit._id))}>
                    <DeleteIcon />
                </IconButton>

                <IconButton sx={{  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}} edge="end" aria-label="calendar" onClick={() => toggleCalendar(String(habit._id))}>
                  <CalendarMonthIcon />
                </IconButton>
                
                </div>
                <div className=' flex justify-center'>
                <Button
                variant='default' size='sm'
                
                    >
                <Link href={{
                  pathname: `/dashboard/habits/${habit._id}`,
                  query: { color: habit.color, title: habit.name },
                }}>Habit Progress & Charts</Link>
                </Button>
                </div>
                
            </Box>
          </ListItem>
          <ListItem>
            <HabitCalendar habit={habit} isVisible={visibleCalendar === String(habit._id)} colorCheck={habit.color}/>
          </ListItem>
          </Card>
        </React.Fragment>
      ))}
    </List>
  );
};

export default HabitList;