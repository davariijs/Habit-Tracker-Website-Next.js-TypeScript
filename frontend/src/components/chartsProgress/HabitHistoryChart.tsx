'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, getDaysInMonth } from 'date-fns';

interface HabitHistoryChartProps {
  habitId: string;
  range: 'week' | 'month' | 'year';
}


interface ChartData {
  time: string;
  completed: number;
}

const HabitHistoryChart: React.FC<HabitHistoryChartProps> = ({ habitId, range }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [yAxisMax, setYAxisMax] = useState(7); 

  useEffect(() => {
    fetch(`/api/progress/${habitId}/${range}`)
      .then((res) => res.json())
      .then((apiData) => {
        if (apiData.history) {
          setData(apiData.history);

          // Determine Y-axis max based on range
          if (range === 'month') {
            setYAxisMax(getDaysInMonth(new Date()));
          } else if (range === 'year') {
            // Find the maximum completed value for the year
            const maxCompleted = apiData.history.reduce((max: number, item: ChartData) => Math.max(max, item.completed), 0);
            setYAxisMax(maxCompleted);
          }
        }
      })
      .catch((error) => console.error("Error fetching data for bar chart:", error));
  }, [habitId, range]);

  const xAxisTickFormatter = (tick: string) => {
    if (range === 'month') {
        return tick.slice(-2); //show only day
    }
    return tick;
  };

  return (
    <div>
      <h3>History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={xAxisTickFormatter}/>
          <YAxis domain={[0, yAxisMax]} />
          <Tooltip />
          <Bar dataKey="completed" fill="#82ca9d" name="Completions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitHistoryChart;