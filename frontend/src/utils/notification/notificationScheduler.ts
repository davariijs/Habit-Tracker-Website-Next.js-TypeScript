import schedule from "node-schedule";
import HabitModel from "@/models/Habit";
import { sendPushNotification } from "./pushNotificationService";

export const scheduleNotifications = async () => {
  const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });

  habits.forEach((habit) => {
    const { reminderTime, _id, name, userEmail,question } = habit;

    if (reminderTime) {
      const reminderDate = new Date(reminderTime);

      if (_id && typeof _id === "object" && "_id" in habit) {
        const habitId = (_id as unknown as { toString: () => string }).toString();

      schedule.scheduleJob(habitId.toString(), reminderDate, async () => {
        console.log(`⏰ Sending notification for habit: ${name}`);
        await sendPushNotification(userEmail, name, question);
      });
    }
  }
  });
};