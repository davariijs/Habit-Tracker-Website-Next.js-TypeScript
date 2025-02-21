'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface HabitHistoryChartProps {
  habitId: string;
  habitColor: string;
  range: 'week' | 'month' | 'year';
}

interface ChartData {
  time: string;
  completed: number;
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
  ChartTooltip,
  ChartTooltipContent
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
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>History</CardTitle>
          <CardDescription>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[280px] w-full'
        >
          <BarChart
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
            <YAxis />
            <ChartTooltip
            />
            <Bar dataKey="completed" fill={habitColor} name="Completions" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default HabitHistoryChart;
