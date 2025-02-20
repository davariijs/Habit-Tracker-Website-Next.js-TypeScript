'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface HabitScoreChartProps {
  habitId: string;
  habitColor: string;
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

const HabitScoreChart: React.FC<HabitScoreChartProps> = ({ habitId, range,habitColor }) => {
  const [data, setData] = useState<PercentageData[]>([]);

  useEffect(() => {
    fetch(`/api/progress/${habitId}/${range}`)
      .then(res => res.json())
      .then(apiData => {
        if (apiData.history) {
          const totalPossible = range === 'day' ? 1 : range === 'week' ? 7 : 30;
          
          const percentageData = apiData.history.map((item: ChartData) => ({
            time: item.time,
            score: parseFloat(((item.completed / totalPossible) * 100).toFixed(0)),
          }));

          setData(percentageData);
        }
      })
      .catch(error => console.error("Error fetching data for line chart:", error));
  }, [habitId, range]);

  return (
    <div>
      <h3>Completion %</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
          <Tooltip />
          <Line type="monotone" dataKey="score" stroke={habitColor} name="Completion %" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitScoreChart;