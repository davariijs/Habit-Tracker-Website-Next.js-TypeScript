'use client';

import React, { Fragment, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid} from 'recharts';
import * as tf from '@tensorflow/tfjs';

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
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useHabitModel } from './HabitModelContext';
import HabitTrainer from './HabitTrainer';
import { Button } from '../ui/button';
import "@/components/habits/HabitForm.css";

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
  const [predictedData, setPredictedData] = useState<PercentageData[]>([]); // For predicted scores
  const { model } = useHabitModel();
  const [showPredict,setShowPredict] = useState<Boolean>(false);

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


  // New useEffect for making predictions
  useEffect(() => {
    const makePredictions = async () => {
      if (!model) return;

      const today = new Date();
      const futureDates = [];
      for (let i = 1; i <= 7; i++) { // Predict for the next 7 days
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        futureDates.push(futureDate);
      }

      const predictions = await Promise.all(
        futureDates.map(async (date) => {
          const probability = await predictCompletion(date); // Use the prediction function
          return {
            time: date.toLocaleDateString(), // Format the date
            score: probability !== null ? parseFloat((probability * 100).toFixed(0)) : 0, // Convert to percentage
          };
        })
      );

      setPredictedData(predictions);
    };

    makePredictions();
  }, [model, habitId]); // Depend on the model

  // Function to predict completion probability (moved from HabitTrainer)
  const predictCompletion = async (date: Date) => {
    if (!model) {
      console.warn("Model not trained yet.");
      return null;
    }
    const features: any = {};
    const dayOfWeek = date.getDay();
    const dayOfWeekEncoded = Array(7).fill(0);
    dayOfWeekEncoded[dayOfWeek] = 1;
    features.dayOfWeek = dayOfWeekEncoded;
    const completionsLast7Days = await getCompletionsLast7Days(habitId, date);
    features.completionsLast7Days = completionsLast7Days;
    const inputTensor = tf.tensor2d([[
      ...features.dayOfWeek,
      features.completionsLast7Days,
    ]]);
    const predictionTensor = model.predict(inputTensor) as tf.Tensor;
    const probability = (await predictionTensor.data())[0];
    inputTensor.dispose();
    predictionTensor.dispose();
    return probability;
  };
    // Placeholder function - You'll need to implement this!
    async function getCompletionsLast7Days(habitId: string, date: Date): Promise<number> {
    try {
        const response = await fetch(`/api/completions-last-7-days?habitId=${habitId}&date=${date.toISOString()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch completions: ${response.status}`);
        }
        const data = await response.json();
        return data.completions; // Assuming your API returns { completions: number }
    } catch (error) {
        console.error("Error fetching completionsLast7Days:", error);
        return 0; // Or handle the error appropriately
    }
    }

    const clickHandler =()=> {
      setShowPredict((prevShowPredict) => !prevShowPredict)
    }

  return (
    <Fragment>
      <div className='flex justify-center'>
      <Button
        variant='default' size='lg'
        className=''
        onClick={clickHandler}
            >
        Get Predictions for doing hobbits
        </Button>
      </div>
      {showPredict ? 
    <Card>
    <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
      <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
        <CardTitle>Predictions for doing hobbits</CardTitle>
        <CardDescription>
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent className='px-2 sm:p-6'>
      <HabitTrainer habitId={habitId} />  
      <ChartContainer
        config={chartConfig}
        className='aspect-auto h-[280px] w-full'
      >
        <LineChart
          accessibilityLayer
          data={[...data, ...predictedData]} 
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
          <Line
            type="monotone"
            dataKey="score"
            data={predictedData} // Ensure predictions are separated
            stroke="red" // Different color for predictions
            name="Predicted %"
            strokeDasharray="5 5" // Dashed line for predictions
            strokeOpacity={0.7}
          />
        </LineChart>
      </ChartContainer>
    </CardContent>
    </Card>
    : null
  }

      <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Score</CardTitle>
          <CardDescription>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <HabitTrainer habitId={habitId} />  
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[280px] w-full'
        >
          <LineChart
            accessibilityLayer
            data={[...data]} 
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
    </Fragment>
  );
}

export default HabitScoreChart;
