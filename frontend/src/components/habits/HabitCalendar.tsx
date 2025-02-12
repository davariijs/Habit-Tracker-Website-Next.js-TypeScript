// components/HabitCalendar.tsx
"use client";

import React, { useState } from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material'; // Use Grid
import { CheckCircle, Cancel } from '@mui/icons-material';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  addDays
} from 'date-fns';
import { IHabit } from '@/models/Habit';

interface HabitCalendarProps {
  habit: IHabit;
  isVisible: boolean; // Add isVisible prop
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit, isVisible }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  // Get all days of the month, starting on the correct day of the week
  const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const daysOfMonth = eachDayOfInterval({ start: weekStart, end: addDays(monthEnd, 6-monthEnd.getDay()) });

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }

  return (
    <Box>
      <Typography variant="h6" align="center">{format(monthStart, 'MMMM yyyy')}</Typography> {/* Month/Year */}
      <Grid container spacing={1}>
        {/* Days of the week headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
          <Grid item xs={12/7} key={dayName} textAlign="center">
            <Typography variant="caption">{dayName}</Typography>
          </Grid>
        ))}

        {/* Days of the month */}
        {daysOfMonth.map((day) => {
          const completion = habit.completions.find((c) => isSameDay(c.date, day));
          const isCompleted = completion ? completion.completed : false;
          const isInCurrentMonth = day >= monthStart && day <= monthEnd;

          return (
            <Grid item xs={12/7} key={day.toISOString()} textAlign="center">
              {isInCurrentMonth ? (
                isCompleted ? (
                  <IconButton size="small" color="success">
                    <CheckCircle />
                  </IconButton>
                ) : (
                  <IconButton size="small" color="error">
                    <Cancel />
                  </IconButton>
                )
              ) : (
                <Box width="24px" height="24px"/> // Placeholder for days outside current month
              )}
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default HabitCalendar;