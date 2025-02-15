"use client";

import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { Button } from '@/components/ui/button';
import { IHabit } from '@/models/Habit';
import { useTheme } from 'next-themes';

export interface HabitFormData {
  userId: string;
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

const HabitForm: React.FC<HabitFormProps> = ({ onSubmit, initialData, userId }) => {

  const [name, setName] = useState('');
  const [color, setColor] = useState('#007bff');
  const [question, setQuestion] = useState('');
  const [frequencyType, setFrequencyType] = useState<IHabit['frequencyType']>('everyday');
  const [frequencyValue, setFrequencyValue] = useState(1);
  const [frequencyValue2, setFrequencyValue2] = useState<number | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { theme } = useTheme();
  
  // Use useEffect to update form state when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setQuestion(initialData.question);
      setFrequencyType(initialData.frequencyType);
      setFrequencyValue(initialData.frequencyValue);
      setFrequencyValue2(initialData.frequencyValue2 || undefined);
      setReminderTime(initialData.reminderTime || '');
    } else {
      // Reset form fields when switching to "create" mode
      setName('');
      setColor('#007bff');
      setQuestion('');
      setFrequencyType('everyday');
      setFrequencyValue(1);
      setFrequencyValue2(undefined);
      setReminderTime('');
    }
  }, [initialData]);

  

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    const habitData: HabitFormData = {
      userId,
      name,
      color,
      question,
      frequencyType,
      frequencyValue,
      frequencyValue2,
      reminderTime,
      startDate: initialData ? initialData.startDate : new Date(), // Use existing startDate for update
      completions: initialData ? initialData.completions : [], // Preserve completions for update
    };

    onSubmit(habitData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)', mt: 1}} >
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Habit Name"
        name="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="question"
        label="Reminder Question"
        name="question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        error={!!errors.question}
        helperText={errors.question}
      />
      <TextField
        margin="normal"
        fullWidth
        id="color"
        label="Color"
        name="color"
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="frequency-type-label">Frequency</InputLabel>
        <Select
          labelId="frequency-type-label"
          id="frequencyType"
          value={frequencyType}
          label="Frequency"
          onChange={(e) => setFrequencyType(e.target.value as IHabit['frequencyType'])}
        >
          <MenuItem value="everyday">Everyday</MenuItem>
          <MenuItem value="everyXDays">Every X Days</MenuItem>
          <MenuItem value="XTimesPerWeek">X Times Per Week</MenuItem>
          <MenuItem value="XTimesPerMonth">X Times Per Month</MenuItem>
          <MenuItem value="XTimesInXDays">X Times in X Days</MenuItem>
        </Select>
      </FormControl>

      {/* Conditional Rendering based on Frequency Type */}
      {frequencyType === 'everyXDays' && (
        <TextField
          margin="normal"
          required
          fullWidth
          id="frequencyValue"
          label="Every How Many Days?"
          name="frequencyValue"
          type="number"
          value={frequencyValue}
          onChange={(e) => setFrequencyValue(parseInt(e.target.value, 10))}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      )}
      {(frequencyType === 'XTimesPerWeek' || frequencyType === 'XTimesPerMonth') && (
        <TextField
          margin="normal"
          required
          fullWidth
          id="frequencyValue"
          label={frequencyType === 'XTimesPerWeek' ? 'Times Per Week' : 'Times Per Month'}
          name="frequencyValue"
          type="number"
          value={frequencyValue}
          onChange={(e) => setFrequencyValue(parseInt(e.target.value, 10))}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
        />
      )}
      {frequencyType === 'XTimesInXDays' && (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="frequencyValue"
            label="Times"
            name="frequencyValue"
            type="number"
            value={frequencyValue}
            onChange={(e) => setFrequencyValue(parseInt(e.target.value, 10))}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="frequencyValue2"
            label="In How Many Days?"
            name="frequencyValue2"
            type="number"
            value={frequencyValue2}
            onChange={(e) => setFrequencyValue2(parseInt(e.target.value, 10))}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </>
      )}

      <TextField
        margin="normal"
        fullWidth
        id="reminderTime"
        label="Reminder Time (HH:mm)"
        name="reminderTime"
        value={reminderTime}
        onChange={(e) => setReminderTime(e.target.value)}
        placeholder="e.g., 19:00"
      />
      <Button type="submit" variant='default' className='w-full mt-2' size='lg'
      >
        {initialData ? 'Update Habit' : 'Create Habit'}
      </Button>
    </Box>
  );
};

export default HabitForm;