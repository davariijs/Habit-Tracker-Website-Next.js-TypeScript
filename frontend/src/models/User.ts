import mongoose, { Schema, model, models, Document } from "mongoose";

const pushSubscriptionSchema = new Schema({
  endpoint: { type: String, required: true },
  expirationTime: { type: Number, default: null },
  keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
  },
}, { _id: false }); // Prevent Mongoose from creating an _id for the subdocument

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  pushSubscription?: typeof pushSubscriptionSchema;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String,required: false, default: null },
  pushSubscription: { type: pushSubscriptionSchema, default: null, required: false },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;