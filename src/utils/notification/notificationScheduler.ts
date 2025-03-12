import schedule from "node-schedule";
import HabitModel, { IHabit } from "@/models/Habit";
import { sendPushNotification } from "./pushNotificationService";

export const scheduleNotifications = async (): Promise<void> => {
  console.log("📅 Loading habits for notification scheduling...");

  const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });

  // Cancel all existing jobs first
  Object.keys(schedule.scheduledJobs).forEach((jobName) => {
    schedule.scheduledJobs[jobName].cancel();
  });

  habits.forEach((habit) => {
    const { reminderTime, _id, name, userEmail, question } = habit;
    const habitId = String(_id);

    if (!reminderTime) return;

    console.log(`📅 Raw reminderTime for "${name}":`, reminderTime);
    
    // Parse time string directly (format: "HH:MM")
    let hours, minutes;
    
    // Check if it's a time string format (HH:MM)
    if (typeof reminderTime === 'string' && /^\d{1,2}:\d{2}$/.test(reminderTime)) {
      const [hoursStr, minutesStr] = reminderTime.split(':');
      hours = parseInt(hoursStr, 10);
      minutes = parseInt(minutesStr, 10);
    } else {
      // Try to parse as a date as fallback
      try {
        const reminderDate = new Date(reminderTime);
        if (!isNaN(reminderDate.getTime())) {
          hours = reminderDate.getHours();
          minutes = reminderDate.getMinutes();
        } else {
          console.error(`❌ Could not parse time for habit "${name}": ${reminderTime}`);
          return;
        }
      } catch (error) {
        console.error(`❌ Error parsing time for habit "${name}":`, error);
        return;
      }
    }
    
    // Validate hours and minutes
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error(`❌ Invalid time values for habit "${name}": hours=${hours}, minutes=${minutes}`);
      return;
    }
    
    console.log(`⏰ Extracted time for "${name}": ${hours}:${minutes}`);
    
    // Create a rule for the scheduler - run every day at the specified time
    const rule = new schedule.RecurrenceRule();
    rule.hour = hours;
    rule.minute = minutes;
    
    // Schedule the job using the rule
    schedule.scheduleJob(habitId, rule, async () => {
      console.log(`⏰ Sending notification for habit: ${name}`);
      await sendPushNotification(userEmail, habitId, name, question);
    });

    console.log(`✅ Scheduled notification for "${name}" at ${hours}:${minutes} every day`);
  });
};