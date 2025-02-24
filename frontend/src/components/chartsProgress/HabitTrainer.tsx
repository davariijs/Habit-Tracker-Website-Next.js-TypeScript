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
      // Convert the data to tensors
      const xs = tf.tensor2d(data.map((item: any) => [
        ...item.dayOfWeek,
        item.completionsLast7Days,
      ]));
      const ys = tf.tensor2d(data.map((item: any) => [item.completed]));

      setTrainingStatus('Creating model...');
      // Define the model
      const newModel = tf.sequential();
      newModel.add(tf.layers.dense({
        units: 10, // Number of neurons in the hidden layer
        activation: 'relu', // Activation function
        inputShape: [xs.shape[1]], // Input shape based on the number of features
      }));
      newModel.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })); // Output layer (sigmoid for probability)

      // Compile the model
      newModel.compile({
        optimizer: 'adam', // Optimizer
        loss: 'binaryCrossentropy', // Loss function for binary classification
        metrics: ['accuracy'], // Evaluation metric
      });

      setTrainingStatus('Training model...');
      // Train the model
      await newModel.fit(xs, ys, {
        epochs: 50, // Number of training iterations
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            setTrainingStatus(`Training... Epoch ${epoch + 1}: Loss = ${logs?.loss.toFixed(4)}, Accuracy = ${logs?.acc.toFixed(4)}`);
          },
        },
      });

      setModel(newModel);
      setTrainingStatus('Model trained!');
      xs.dispose(); //clean memory
      ys.dispose(); //clean memory
    };

    trainModel();
  }, [habitId]);

    

    return (
      <div>
        {/* <p>Training Status: {trainingStatus}</p> */}
        {/* You can add a button to manually trigger training if needed */}
        {/* You could also display the trained model's weights, etc. */}
      </div>
    );
  };

  export default HabitTrainer;