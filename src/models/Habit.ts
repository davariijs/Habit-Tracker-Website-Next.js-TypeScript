import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  userEmail:string;
  name: string;
  color: string;
  question: string;
  frequencyType: 'everyday' | 'everyXDays' | 'XTimesPerWeek' | 'XTimesPerMonth' | 'XTimesInXDays';
  frequencyValue: number;
  frequencyValue2?: number;
  reminderTime?: string;
  reminderTimeUtc?: string;
  startDate: Date;
  completions: { date: Date; completed: boolean }[];
}

const HabitSchema: Schema = new Schema({
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  question: { type: String, required: true },
  frequencyType: {
    type: String,
    required: true,
    enum: ['everyday', 'everyXDays', 'XTimesPerWeek', 'XTimesPerMonth', 'XTimesInXDays'],
  },
  frequencyValue: { type: Number, required: true },
  frequencyValue2: { type: Number },
  reminderTime: { type: String },
  reminderTimeUtc: { type: String },
  startDate: { type: Date, default: Date.now },
  completions: [{
    date: { type: Date },
    completed: { type: Boolean, default: false },
  }],
});

const HabitModel: Model<IHabit> = mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);

export default HabitModel;