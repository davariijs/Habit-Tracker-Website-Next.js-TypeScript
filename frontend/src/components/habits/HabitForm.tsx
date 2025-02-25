"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { IHabit } from '@/models/Habit';
import { useTheme } from 'next-themes';
import { useSession } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl as ShadcnFormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form'; 
import { Box, MenuItem, Select, SelectChangeEvent, InputLabel, FormControl, InputBase } from '@mui/material';
import "./HabitForm.css";


const habitFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  question: z.string().min(1, { message: 'Question is required' }),
  color: z.string(),
  frequencyType: z.enum([
    'everyday',
    'everyXDays',
    'XTimesPerWeek',
    'XTimesPerMonth',
    'XTimesInXDays',
  ]),
  frequencyValue: z.coerce.number().int().positive().optional(),
  frequencyValue2: z.coerce.number().int().positive().optional(),
  reminderTime: z.string().optional(),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;
export interface HabitFormData {
  userId: string;
  userEmail:string;
  name: string;
  color: string;
  question: string;
  frequencyType: IHabit['frequencyType'];
  frequencyValue: number;
  frequencyValue2?: number;
  reminderTime?: string;
  startDate: Date;
  completions: { date: Date; completed: boolean }[];
}

interface HabitFormProps {
  onSubmit: (habitData: HabitFormData) => void;
  initialData?: IHabit | null; // Accepts IHabit or null
  userId: string;
}

const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, initialData, userId}) => {
  const { data: session } = useSession();
  const userEmailForm = session?.user?.email ?? "";
  const userEmail: string = userEmailForm;
  const { theme } = useTheme();


  // Initialize the form with react-hook-form and Zod
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || '#007bff',
      question: initialData?.question || '',
      frequencyType: initialData?.frequencyType, // Initialize as empty string
      frequencyValue: initialData?.frequencyValue,
      frequencyValue2: initialData?.frequencyValue2,
      reminderTime: initialData?.reminderTime || '',
    },
  });

  const onSubmitHandler = (data: HabitFormValues) => {
    
      const habitData: HabitFormData = {
        userId,
        userEmail,
        name: data.name,
        color: data.color,
        question: data.question,
        frequencyType: data.frequencyType,
        frequencyValue: data.frequencyValue || 1,
        frequencyValue2: data.frequencyValue2,
        reminderTime: data.reminderTime,
        startDate: initialData ? initialData.startDate : new Date(),
        completions: initialData ? initialData.completions : [],
      };

      onSubmit(habitData);
  };

  const getTextColor = () => {
    return theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
  };

  const getMenuItemTextColor = () => {
    return theme === 'dark' ? '#fff' : '#000'; // White text in dark mode, black in light mode
};



  return (
    <Box component="div"
      sx={{
        color: getTextColor(),
        mt: 1
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} noValidate className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Habit Name</FormLabel>
                <ShadcnFormControl>
                  <Input {...field} />
                </ShadcnFormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Question</FormLabel>
                <ShadcnFormControl>
                  <Input {...field} />
                </ShadcnFormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <ShadcnFormControl>
                  <Input type="color" {...field} />
                </ShadcnFormControl>
                <FormMessage />
              </FormItem>
            )}
          />

            <FormField
            control={form.control}
            name="frequencyType"
            render={({ field }) => (
              <FormItem>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="frequency-type-label" sx={{ color: getTextColor() }} >Frequency</InputLabel>
                  <Controller
                    name="frequencyType"
                    control={form.control}
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                      <Select
                        labelId="frequency-type-label"
                        id="frequencyType"
                        value={value}
                        label="Frequency"
                        onChange={(event: SelectChangeEvent<IHabit['frequencyType']>) => {
                          onChange(event.target.value as IHabit['frequencyType']);
                        }}
                        onBlur={onBlur}
                        inputRef={ref}
                        displayEmpty
                        renderValue={(selected) => {
                          if (!selected) {
                            return <em style={{color: getTextColor()}}></em>;
                          }
                          const getFrequencyDisplayText = (frequencyType?: IHabit['frequencyType']) => {
                            switch (frequencyType) {
                              case 'everyday':        return 'Everyday';
                              case 'everyXDays':       return 'Every X Days';
                              case 'XTimesPerWeek':    return 'X Times Per Week';
                              case 'XTimesPerMonth':   return 'X Times Per Month';
                              case 'XTimesInXDays':    return 'X Times in X Days';
                              default:                 return '';
                            }
                          };
                          return getFrequencyDisplayText(selected as IHabit['frequencyType']);
                        }}

                        sx={{
                          '& .MuiInputBase-root': {
                              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)', // Dynamic border color
                          },
                          '& .MuiInputBase-root:hover': {
                              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)', // Dynamic hover border color
                          },
                          '& .MuiInputBase-root.Mui-focused': {
                              borderColor: theme === 'dark' ? '#90caf9' : '#1976d2', // Dynamic focused border color
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'inherit',
                          },
                          color: theme === 'dark' ? '#fff' : '#000',
                      }}

                      className="my-custom-select"  // Add this class!
                      MenuProps={{
                          className: "my-custom-select-menu", // Add this class to MenuProps!
                      }}
                      >
                        <MenuItem  value="" disabled><em>Select Frequency</em></MenuItem>
                        <MenuItem  value="everyday">Everyday</MenuItem>
                        <MenuItem  value="everyXDays">Every X Days</MenuItem>
                        <MenuItem  value="XTimesPerWeek">X Times Per Week</MenuItem>
                        <MenuItem  value="XTimesPerMonth">X Times Per Month</MenuItem>
                        <MenuItem  value="XTimesInXDays">X Times in X Days</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
                <FormMessage /> {/* Keep FormMessage for validation errors */}
              </FormItem>
            )}
          />

          {/* Conditional Rendering based on Frequency Type */}
          {form.getValues('frequencyType') === 'everyXDays' && (
            <FormField
              control={form.control}
              name="frequencyValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: getTextColor() }}>Every How Many Days?</FormLabel>
                  <FormControl fullWidth>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(form.getValues('frequencyType') === 'XTimesPerWeek' || form.getValues('frequencyType') === 'XTimesPerMonth') && (
            <FormField
              control={form.control}
              name="frequencyValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: getTextColor() }}>{form.getValues('frequencyType') === 'XTimesPerWeek' ? 'Times Per Week' : 'Times Per Month'}</FormLabel>
                  <FormControl fullWidth>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          )}


          {form.getValues('frequencyType') === 'XTimesInXDays' && (
            <>
              <FormField
                control={form.control}
                name="frequencyValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: getTextColor() }}>Times</FormLabel>
                    <FormControl fullWidth>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequencyValue2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: getTextColor() }}>In How Many Days?</FormLabel>
                    <FormControl fullWidth>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="reminderTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Time (HH:mm)</FormLabel>
                <ShadcnFormControl>
                  <Input placeholder="e.g., 19:00" {...field} />
                </ShadcnFormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant='default' className='w-full mt-2' size='lg'>
            {initialData ? 'Update Habit' : 'Create Habit'}
          </Button>
        </form>
      </Form>
    </Box>
  );
};

export default HabitForm;