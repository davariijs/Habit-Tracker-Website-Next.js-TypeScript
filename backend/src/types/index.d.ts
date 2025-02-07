import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGoal extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    status: "in-progress" | "completed";
    startDate?: Date;
    endDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface IProgress extends Document {
    goalId: mongoose.Types.ObjectId;
    date: Date;
    progress: number;
    createdAt?: Date;
  }

  

