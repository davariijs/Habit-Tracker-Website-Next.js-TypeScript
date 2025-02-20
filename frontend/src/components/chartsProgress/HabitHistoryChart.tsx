'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface HabitHistoryChartProps {
  habitId: string;
  habitColor: string;
  range: 'week' | 'month' | 'year';
}

interface ChartData {
  time: string;
  completed: number;
}

const HabitHistoryChart: React.FC<HabitHistoryChartProps> = ({ habitId, range,habitColor}) => {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetch(`/api/progress/${habitId}/${range}`)
      .then(res => res.json())
      .then(apiData => {
        if (apiData.history) {
          setData(apiData.history);
        }
      })
      .catch(error => console.error("Error fetching data for bar chart:", error));
  }, [habitId, range]);

  return (
    <div>
      <h3>History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="completed" fill={habitColor} name="Completions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitHistoryChart;