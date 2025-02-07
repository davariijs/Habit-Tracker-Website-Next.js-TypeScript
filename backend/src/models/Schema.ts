import mongoose, { Document, Schema } from "mongoose";
import { IGoal, IProgress, IUser } from "../types";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const GoalSchema = new Schema<IGoal>(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      title: { type: String, required: true },
      description: { type: String },
      status: { type: String, default: "in-progress" },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    { timestamps: true }
  );

  const ProgressSchema = new Schema<IProgress>(
    {
      goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
      date: { type: Date, required: true },
      progress: { type: Number, required: true },
    },
    { timestamps: true }
  );


  export default mongoose.models.Progress || mongoose.model<IProgress>("Progress", ProgressSchema);
  export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
  export default mongoose.models.Goal || mongoose.model<IGoal>("Goal", GoalSchema);