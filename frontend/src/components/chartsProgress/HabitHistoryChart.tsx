'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface HabitHistoryChartProps {
  habitId: string;
  range: 'week' | 'month' | 'year';
}

const HabitHistoryChart: React.FC<HabitHistoryChartProps> = ({ habitId, range }) => {
  const [data, setData] = useState<{ time: string; completed: number }[]>([]);

  useEffect(() => {
    fetch(`/api/progress/${habitId}/${range}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data.history);
      });
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
          <Bar dataKey="completed" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitHistoryChart;