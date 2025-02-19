'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface HabitScoreChartProps {
  habitId: string;
  range: 'day' | 'week' | 'month' | 'year';
}

interface ChartData {
    time: string;
    completed: number;
  }

  interface PercentageData {
    time: string;
    score: number;
}

const HabitScoreChart: React.FC<HabitScoreChartProps> = ({ habitId, range }) => {
    const [data, setData] = useState<PercentageData[]>([]);

   useEffect(() => {
      fetch(`/api/progress/${habitId}/${range}`)
        .then((res) => res.json())
        .then((apiData) => {
          if (apiData.history) {
            // Calculate percentage for each data point
            const percentageData = apiData.history.map((item: ChartData) => ({
              time: item.time,
              score: range === 'day' ? (item.completed > 0 ? 100 : 0) : item.completed, // For 'day', it's 0 or 100
            }));
  
            // Normalize to percentages for week, month, and year
              if (range === 'week') {
                percentageData.forEach((item: PercentageData) => { item.score = (item.score / 7) * 100; });
              } else if (range === 'month') {
                const daysInMonth = parseInt(format(new Date(), 'd')); // Get days in current month
                percentageData.forEach((item: PercentageData) => { item.score = (item.score / daysInMonth) * 100 });
              } else if (range === 'year') {
                let totalCompletions = 0;
                percentageData.forEach((item: PercentageData) => { totalCompletions += item.score });
                percentageData.forEach((item: PercentageData) => {item.score = totalCompletions > 0 ? (item.score / totalCompletions) * 100 : 0; });
              }
  
            setData(percentageData);
          }
        })
        .catch((error) => console.error("Error fetching data for line chart:", error));
    }, [habitId, range]);

  return (
    <div>
      <h3>Score</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#8884d8" name="Completion %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitScoreChart;