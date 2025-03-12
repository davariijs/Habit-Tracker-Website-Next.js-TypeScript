import mongoose, { Document, Schema } from "mongoose";

export interface INotificationLog extends Document {
  habitId: string;
  userEmail: string;
  sentDate: string;
}

const notificationLogSchema = new Schema({
  habitId: { type: String, required: true },
  userEmail: { type: String, required: true },
  sentDate: { type: String, required: true },
});


notificationLogSchema.index({ habitId: 1, userEmail: 1, sentDate: 1 }, { unique: true });

const NotificationLog = mongoose.models.NotificationLog || 
mongoose.model<INotificationLog>("NotificationLog", notificationLogSchema);

export default NotificationLog;