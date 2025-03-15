// "use client";

// import React, {useState} from 'react';
// import {
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Checkbox,
//   Box,
//   CircularProgress,
//   Typography,
// } from '@mui/material';
// import { IHabit } from '@/models/Habit';
// import useSWR from 'swr';
// import { fetcher, updateHabitCompletion, deleteHabit } from '@/lib/habitapi';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import HabitCalendar from './HabitCalendar';
// import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
// import EditIcon from '@mui/icons-material/Edit';
// import { useTheme } from 'next-themes';
// import { Button } from '../ui/button';
// import {Card} from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import { DeleteIconButton } from '../modal/delete-button';

// interface HabitListProps {
//   userId: string;
//   onEditHabit: (habit: IHabit) => void;
// }

// const HabitList: React.FC<HabitListProps> = ({ userId, onEditHabit}) => {
//   const { data, error, isLoading, mutate } = useSWR(`/api/habits?userId=${userId}`, fetcher);
//   const [visibleCalendar, setVisibleCalendar] = useState<string | null>(null);
//   const { theme } = useTheme();
//   const [loading, setLoading] = useState<string | null>(null);


//   const router = useRouter();
//     const toggleCalendar = (habitId: string) => {
//       setVisibleCalendar((prevId) => (prevId === habitId ? null : habitId));
//     };
    
//   const onToggleComplete = async (habitId: string, date: Date, completed: boolean) => {
//     mutate(
//       async (currentData: any) => {
//         if (!currentData) return currentData;
//         const updatedHabits = currentData.habits.map((h: IHabit) => {
//           if (h._id === habitId) {
//             const newCompletions = [...h.completions];
//             const existingCompletionIndex = newCompletions.findIndex((comp) =>
//               isSameDay(comp.date, date)
//             );
//             if (existingCompletionIndex > -1) {
//               newCompletions[existingCompletionIndex].completed = completed;
//             } else {
//               newCompletions.push({ date, completed });
//             }
//             return { ...h, completions: newCompletions };
//           }
//           return h;
//         });
//         return { ...currentData, habits: updatedHabits };
//       },
//       false
//     );

//     try {
//       await updateHabitCompletion(habitId, date, completed);
//       window.location.reload();
//     } catch (err) {
//       console.error(err);
//       mutate();
//     }
//   };

//   const onDeleteHabit = async (habitId: string) => {
//     mutate(
//       async (currentData: any) => {
//         if (!currentData) return currentData;
//         const updatedHabits = currentData.habits.filter((h: IHabit) => h._id !== habitId);
//         return { ...currentData, habits: updatedHabits };
//       },
//       false
//     );

//     try {
//       await deleteHabit(habitId);
//       mutate();
//     } catch (err) {
//       console.error(err);
//       mutate();
//     }
//   };

//   if (isLoading) return <div className='flex justify-center items-center mt-40'><CircularProgress /></div>;
//   if (error) return <div>Failed to load habits</div>;
//   if (!data) return <div>No habits found</div>;

//   const habits: IHabit[] = data.habits;
//     const today = new Date();
//     const weekStart = startOfWeek(today, { weekStartsOn: 1 });
//     const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
//     const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

//     const handleEditClick = (habit: IHabit) => {
//       onEditHabit(habit);
//     };


//   return (
//     <List>
//       {habits.map((habit) => (
//         <React.Fragment key={String(habit._id)}>
//           <Card className='mb-8 p-3'>
//           <ListItem>
//           <Box sx={{ width: '100%' , cursor: 'pointer'}}>
//             <ListItemText
//               primary={habit.name}
//               secondary={`${habit.question} - ${
//                 habit.frequencyType === 'everyXDays'
//                     ? `every ${habit.frequencyValue} days`
//                     : habit.frequencyType === 'everyday'
//                     ? `Everyday`
//                     : habit.frequencyType === 'XTimesPerWeek'
//                     ? `${habit.frequencyValue} times per week`
//                     : habit.frequencyType === 'XTimesPerMonth'
//                     ? `${habit.frequencyValue} times per month`
//                     : habit.frequencyType === 'XTimesInXDays'
//                     ? `${habit.frequencyValue} times in ${habit.frequencyValue2} days`
//                     : ''
//                 }`}
//               slotProps={{ primary: { style: { color: habit.color } },
//               secondary: { style: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' } }
//              }} 
//             />
//             <Box sx={{ marginTop:"20px"}} display="flex" justifyContent="center" alignItems="center" gap={1}>
//                 {daysOfWeek.map((day) => {
//                     const completion = habit.completions.find((c) => isSameDay(c.date, day));
//                     const isCompleted = completion ? completion.completed : false;

//                     return (
//                         <Box key={day.toISOString()} display="flex" flexDirection="column" alignItems="center">
//                             <Typography variant="caption">{format(day, 'EEE')}</Typography>
//                             <Checkbox
//                                 checked={isCompleted}
//                                 onChange={() => onToggleComplete(String(habit._id), day, !isCompleted)}
//                                 sx={{
//                                     color: habit.color,
//                                     '&.Mui-checked': {
//                                         color: habit.color,
//                                     },
//                                 }}
//                             />
//                         </Box>
//                     );
//                 })}
//               </Box>
//               <div className='flex justify-center my-3'>
//                 <IconButton
//                     sx={{  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}}
//                     edge="end"
//                     aria-label="edit"
//                     onClick={() => handleEditClick(habit)}
//                 >
//                   <EditIcon />
//                 </IconButton>

//                 <DeleteIconButton
//                   onDelete={onDeleteHabit}
//                   habitId={String(habit._id)}
//                   itemName="habit"
//                 />

//                 <IconButton sx={{  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'}} edge="end" aria-label="calendar" onClick={() => toggleCalendar(String(habit._id))}>
//                   <CalendarMonthIcon />
//                 </IconButton>
                
//                 </div>
//                 <div className=' flex justify-center'>
//                 <Button
//                   variant='default'
//                   size='sm'
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setLoading(String(habit._id));
//                     const url = `/dashboard/habits/${habit._id}?color=${encodeURIComponent(habit.color)}&title=${encodeURIComponent(habit.name)}`;
//                     router.push(url);
//                   }}
//                   disabled={loading === habit._id}
//                 >
//                   {loading === habit._id ? (
//                     <CircularProgress size={20} color="inherit" />
//                   ) : (
//                     'Habit Progress & Charts'
//                   )}
//                 </Button>
//                 </div>

//                 <div className=' flex justify-center mt-6'>
//                 <HabitCalendar habit={habit} isVisible={visibleCalendar === String(habit._id)} colorCheck={habit.color}/>
//                 </div>
                
//             </Box>
//           </ListItem>
//           </Card>
//         </React.Fragment>
//       ))}
//     </List>
//   );
// };

// export default HabitList;



"use client";

import React, { useState } from 'react';
import {
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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HabitCalendar from './HabitCalendar';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { DeleteIconButton } from '../modal/delete-button';

interface HabitListProps {
  userId: string;
  onEditHabit: (habit: IHabit) => void;
}

const HabitList: React.FC<HabitListProps> = ({ userId, onEditHabit }) => {
  const { data, error, isLoading, mutate } = useSWR(`/api/habits?userId=${userId}`, fetcher);
  const [visibleCalendar, setVisibleCalendar] = useState<string | null>(null);
  const { theme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const router = useRouter();

  const toggleCalendar = (habitId: string) => {
    setVisibleCalendar((prevId) => (prevId === habitId ? null : habitId));
  };

  const onToggleComplete = async (habitId: string, date: Date, completed: boolean) => {
    // Optimistic update (update the UI immediately)
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
      false // Do not revalidate immediately (we'll revalidate after the API call)
    );

    try {
      // Make the API call
      await updateHabitCompletion(habitId, date, completed);
      // Revalidate after successful API call
      mutate();
    } catch (err) {
      console.error(err);
      // If the API call fails, revert to the previous state (optional)
      mutate(); // Revalidate to get the correct data from the server
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
      mutate(); // Revalidate after successful deletion
    } catch (err) {
      console.error(err);
          mutate(); // Revalidate to get the correct data from the server
        }
      };

      if (isLoading) return <div className='flex justify-center items-center mt-40'><CircularProgress /></div>;
      if (error) return <div>Failed to load habits</div>;
      if (!data) return <div>No habits found</div>;

      const habits: IHabit[] = data.habits;
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const handleEditClick = (habit: IHabit) => {
          onEditHabit(habit);
        };


      return (
        <div className="w-full"> {/* Add a container with w-full */}
            {habits.map((habit) => (
              <Card key={String(habit._id)} className='mb-8 p-3 w-full'> {/* Add w-full to Card */}
                <ListItem className="flex flex-col items-start"> {/* Make ListItem flex-col */}
                  <Box sx={{ width: '100%', cursor: 'pointer' }}>
                    <ListItemText
                      primary={habit.name}
                      secondary={`${habit.question} - ${
                        habit.frequencyType === 'everyXDays'
                            ? `every ${habit.frequencyValue} days`
                            : habit.frequencyType === 'everyday'
                            ? `Everyday`
                            : habit.frequencyType === 'XTimesPerWeek'
                            ? `${habit.frequencyValue} times per week`
                            : habit.frequencyType === 'XTimesPerMonth'
                            ? `${habit.frequencyValue} times per month`
                            : habit.frequencyType === 'XTimesInXDays'
                            ? `${habit.frequencyValue} times in ${habit.frequencyValue2} days`
                            : ''
                        }`}
                      slotProps={{
                        primary: { style: { color: habit.color } },
                        secondary: { style: { color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' } }
                      }}
                    />
                    <Box sx={{ marginTop: "20px" }} display="flex" justifyContent="center" alignItems="center" gap={1} className="w-full overflow-x-auto"> {/* Horizontal scroll for checkboxes */}
                        {daysOfWeek.map((day) => {
                            const completion = habit.completions.find((c) => isSameDay(c.date, day));
                            const isCompleted = completion ? completion.completed : false;

                            return (
                                <Box key={day.toISOString()} display="flex" flexDirection="column" alignItems="center" className="shrink-0"> {/* shrink-0 prevents shrinking */}
                                    <Typography variant="caption">{format(day, 'EEE')}</Typography>
                                    <Checkbox
                                        checked={isCompleted}
                                        onChange={() => onToggleComplete(String(habit._id), day, !isCompleted)}
                                        sx={{
                                            color: habit.color,
                                            '&.Mui-checked': {
                                                color: habit.color,
                                            },
                                            padding: 0, // Reduce padding
                                        }}
                                    />
                                </Box>
                            );
                        })}
                      </Box>
                      <div className='flex justify-center my-3 space-x-2'> {/* Use space-x for spacing */}
                        <IconButton
                            sx={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
                            aria-label="edit"
                            onClick={() => handleEditClick(habit)}
                        >
                          <EditIcon />
                        </IconButton>

                        <DeleteIconButton
                          onDelete={onDeleteHabit}
                          habitId={String(habit._id)}
                          itemName="habit"
                        />

                        <IconButton
                            sx={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}
                            aria-label="calendar"
                            onClick={() => toggleCalendar(String(habit._id))}
                        >
                          <CalendarMonthIcon />
                        </IconButton>

                        </div>
                        <div className='flex justify-center'>
                        <Button
                          variant='default'
                          size='sm'
                          onClick={(e) => {
                            e.preventDefault();
                            setLoading(String(habit._id));
                            const url = `/dashboard/habits/${habit._id}?color=${encodeURIComponent(habit.color)}&title=${encodeURIComponent(habit.name)}`;
                            router.push(url);
                          }}
                          disabled={loading === habit._id}
                        >
                          {loading === habit._id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            'Habit Progress & Charts'
                          )}
                        </Button>
                        </div>

                        <div className='flex justify-center mt-6'>
                        <HabitCalendar habit={habit} isVisible={visibleCalendar === String(habit._id)} colorCheck={habit.color}/>
                        </div>

                    </Box>
                  </ListItem>
              </Card>
            ))}
        </div>
      );
    };

    export default HabitList;