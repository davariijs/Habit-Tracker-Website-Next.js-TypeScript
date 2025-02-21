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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip
} from '@/components/ui/chart';

export const description = 'An interactive bar chart';

const chartConfig = {
  views: {
    label: 'Page Views'
  },
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))'
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))'
  },
  error: {
    label: 'Error',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;


const HabitScoreChart: React.FC<HabitScoreChartProps> = ({ habitId, range,habitColor}) => {
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
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Score</CardTitle>
          <CardDescription>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[280px] w-full'
        >
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`}/>
            <ChartTooltip
            />
            <Line type="monotone" dataKey="score" stroke={habitColor} name="Completion %"  />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default HabitScoreChart;
