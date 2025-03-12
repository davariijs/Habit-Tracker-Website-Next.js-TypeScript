"use client";

import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useHabitModel } from './HabitModelContext';


interface HabitTrainerProps {
  habitId: string;
}

const HabitTrainer: React.FC<HabitTrainerProps> = ({ habitId }) => {
  const [trainingStatus, setTrainingStatus] = useState<string>('Not Trained');
  const { setModel } = useHabitModel();
  
  useEffect(() => {
    const trainModel = async () => {
      if (!habitId) return;

      setTrainingStatus('Fetching data...');
      const response = await fetch(`/api/train-data?habitId=${habitId}`);
      const { data } = await response.json();

      if (!data || data.length === 0) {
        setTrainingStatus('No data available for training.');
        return;
      }

      setTrainingStatus('Preparing data...');
      const xs = tf.tensor2d(data.map((item: any) => [
        ...item.dayOfWeek,
        item.completionsLast7Days,
      ]));
      const ys = tf.tensor2d(data.map((item: any) => [item.completed]));

      setTrainingStatus('Creating model...');
      const newModel = tf.sequential();
      newModel.add(tf.layers.dense({
        units: 10,
        activation: 'relu',
        inputShape: [xs.shape[1]],
      }));
      newModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); 

      newModel.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy', 
        metrics: ['accuracy'], 
      });

      setTrainingStatus('Training model...');

      await newModel.fit(xs, ys, {
        epochs: 50,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingStatus(`Training... Epoch ${epoch + 1}: Loss = ${logs?.loss.toFixed(4)}, Accuracy = ${logs?.acc.toFixed(4)}`);
          },
        },
      });

      setModel(newModel);
      setTrainingStatus('Model trained!');
      xs.dispose();
      ys.dispose();
    };

    trainModel();
  }, [habitId]);

    

    return (
      <div>
      </div>
    );
  };

  export default HabitTrainer;