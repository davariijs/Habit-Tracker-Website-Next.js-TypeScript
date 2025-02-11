// models/Goal.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IGoal extends Document {
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

const GoalSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
}, { timestamps: true }); // Add timestamps (createdAt, updatedAt)

// Prevent model redefinition during hot reloads
export const GoalModel: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);