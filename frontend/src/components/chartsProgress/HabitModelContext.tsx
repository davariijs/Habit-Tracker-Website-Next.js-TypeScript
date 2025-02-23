// HabitModelContext.tsx
"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as tf from '@tensorflow/tfjs';

interface HabitModelContextProps {
  model: tf.LayersModel | null;
  setModel: (model: tf.LayersModel | null) => void;
}

const HabitModelContext = createContext<HabitModelContextProps | undefined>(undefined);

interface HabitModelProviderProps {
  children: ReactNode;
}

export const HabitModelProvider: React.FC<HabitModelProviderProps> = ({ children }) => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);

  const contextValue = {
    model,
    setModel,
  };

  return (
    <HabitModelContext.Provider value={contextValue}>
      {children}
    </HabitModelContext.Provider>
  );
};

export const useHabitModel = () => {
  const context = useContext(HabitModelContext);
  if (context === undefined) {
    throw new Error('useHabitModel must be used within a HabitModelProvider');
  }
  return context;
};