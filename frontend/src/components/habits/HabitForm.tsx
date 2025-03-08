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
import { useForm } from 'react-hook-form'; 
import { Box} from '@mui/material';
import "./HabitForm.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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
  initialData?: IHabit | null;
  userId: string;
  onCancel?: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, initialData, userId,onCancel}) => {
  const { data: session } = useSession();
  const userEmailForm = session?.user?.email ?? "";
  const userEmail: string = userEmailForm;
  const { theme } = useTheme();



  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      color: initialData?.color || '#007bff',
      question: initialData?.question || '',
      frequencyType: initialData?.frequencyType || 'everyday',
      frequencyValue: initialData?.frequencyValue || 1,
      frequencyValue2: initialData?.frequencyValue2 || 1,
      reminderTime: initialData?.reminderTime || '',
    },
  });
  const frequencyType = form.watch('frequencyType');

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
    return theme === 'dark' ? '#fff' : '#000';
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
      <FormLabel>Frequency</FormLabel>
      <Select 
        onValueChange={field.onChange} 
        defaultValue={field.value}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="everyday">Everyday</SelectItem>
          <SelectItem value="everyXDays">Every X Days</SelectItem>
          <SelectItem value="XTimesPerWeek">X Times Per Week</SelectItem>
          <SelectItem value="XTimesPerMonth">X Times Per Month</SelectItem>
          <SelectItem value="XTimesInXDays">X Times in X Days</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>


{frequencyType === 'everyXDays' && (
  <FormField
    control={form.control}
    name="frequencyValue"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Every How Many Days?</FormLabel>
        <ShadcnFormControl>
          <Input 
            type="number" 
            min="1"
            value={field.value || 1} 
            onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value))}
          />
        </ShadcnFormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}

{/* For XTimesPerWeek or XTimesPerMonth */}
{(frequencyType === 'XTimesPerWeek' || frequencyType === 'XTimesPerMonth') && (
  <FormField
    control={form.control}
    name="frequencyValue"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {frequencyType === 'XTimesPerWeek' ? 'Times Per Week' : 'Times Per Month'}
        </FormLabel>
        <ShadcnFormControl>
          <Input 
            type="number" 
            min="1"
            value={field.value || 1} 
            onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value))}
          />
        </ShadcnFormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}

{/* For XTimesInXDays */}
{frequencyType === 'XTimesInXDays' && (
  <>
    <FormField
      control={form.control}
      name="frequencyValue"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Times</FormLabel>
          <ShadcnFormControl>
            <Input 
              type="number" 
              min="1"
              value={field.value || 1} 
              onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value))}
            />
          </ShadcnFormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="frequencyValue2"
      render={({ field }) => (
        <FormItem>
          <FormLabel>In How Many Days?</FormLabel>
          <ShadcnFormControl>
            <Input 
              type="number" 
              min="1"
              value={field.value || 1} 
              onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value))}
            />
          </ShadcnFormControl>
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

        <div className="flex flex-col-reverse gap-2 mt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="w-full order-2 sm:order-1"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant='default' 
            className='w-full order-1 sm:order-2 sm:ml-auto'
            size='lg'
          >
            {initialData ? 'Update Habit' : 'Create Habit'}
          </Button>
        </div>

        </form>
      </Form>
    </Box>
  );
};

export default HabitForm;