'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface HabitScoreChartProps {
  habitId: string;
  range: 'day' | 'week' | 'month' | 'year';
}

const HabitScoreChart: React.FC<HabitScoreChartProps> = ({ habitId, range }) => {
  const [data, setData] = useState<{ time: string; score: number }[]>([]);

  useEffect(() => {
    fetch(`/api/progress/${habitId}/${range}`)
      .then((res) => res.json())
      .then((data) => {
        setData([{ time: range, score: parseFloat(data.score) }]);
      });
  }, [habitId, range]);

  return (
    <div>
      <h3>Score</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitScoreChart;