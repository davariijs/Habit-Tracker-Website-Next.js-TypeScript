import schedule from "node-schedule";
import HabitModel from "@/models/Habit";
import { sendPushNotification } from "./pushNotificationService";

export const scheduleNotifications = async () => {
  console.log("📅 Loading habits for notification scheduling...");

  const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });

  habits.forEach((habit) => {
    const { reminderTime, _id, name, userEmail, question } = habit;
    const habitId = String(_id);

    if (!reminderTime) return;

    const reminderDate = new Date(reminderTime);
    const now = new Date();

    // ✅ Ensure the reminder time is in the future
    if (reminderDate <= now) {
      console.log(`⚠️ Skipping past reminder for "${name}" (Time: ${reminderTime})`);
      return;
    }

    // ✅ Cancel existing scheduled jobs before rescheduling them
    if (schedule.scheduledJobs[habitId]) {
      console.log(`🛑 Cancelling previous schedule for: ${name}`);
      schedule.scheduledJobs[habitId].cancel();
    }

    // ✅ Schedule a new job
    schedule.scheduleJob(habitId, reminderDate, async () => {
      console.log(`⏰ Sending notification for habit: ${name}`);
      await sendPushNotification(userEmail, habitId, name, question);
    });

    console.log(`✅ Scheduled notification for "${name}" at ${reminderTime}`);
  });
};