// utils/notification/notificationScheduler.ts
import HabitModel, { IHabit } from "@/models/Habit";
import { sendPushNotification } from "./pushNotificationService";

// Helper function to parse reminder time (kept from original)
export const parseReminderTime = (reminderTime: string | Date, habitName: string): { hours: number, minutes: number } | null => {
  let hours, minutes;

  if (typeof reminderTime === 'string' && /^\d{1,2}:\d{2}$/.test(reminderTime)) {
    const [hoursStr, minutesStr] = reminderTime.split(':');
    hours = parseInt(hoursStr, 10);
    minutes = parseInt(minutesStr, 10);
  } else {
    try {
      const reminderDate = new Date(reminderTime);
      if (!isNaN(reminderDate.getTime())) {
        hours = reminderDate.getHours();
        minutes = reminderDate.getMinutes();
      } else {
        console.error(`❌ Could not parse time for habit "${habitName}": ${reminderTime}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error parsing time for habit "${habitName}":`, error);
      return null;
    }
  }

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    console.error(`❌ Invalid time values for habit "${habitName}": hours=${hours}, minutes=${minutes}`);
    return null;
  }

  return { hours, minutes };
};

// Main function (kept for API compatibility but modified for serverless)
export const scheduleNotifications = async (): Promise<void> => {
  try {
    const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });
    console.log(`Found ${habits.length} habits with reminders`);

    // Instead of scheduling with node-schedule, we just log the habits
    // The actual notification checks happen through the client-side polling
    // via /api/notification/check-now endpoint
    
    habits.forEach((habit) => {
      const { reminderTime, name, _id } = habit;
      const habitId = String(_id);
      
      if (!reminderTime) return;
      
      const parsedTime = parseReminderTime(reminderTime, name);
      if (!parsedTime) return;
      
      const { hours, minutes } = parsedTime;
      console.log(`✅ Habit "${name}" (${habitId}) will get notifications at ${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
    });
    
    console.log("✅ Notifications will be handled through client-side polling");
  } catch (error) {
    console.error("❌ Error in scheduleNotifications:", error);
  }
};

// Function to check if a specific habit should receive a notification now
// This is used by the check-now API endpoint
export const shouldSendNotificationNow = (habit: IHabit): boolean => {
  const { reminderTime, name } = habit;
  
  if (!reminderTime) return false;
  
  const parsedTime = parseReminderTime(reminderTime, name);
  if (!parsedTime) return false;
  
  const { hours, minutes } = parsedTime;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Match if within a 5-minute window
  return currentHour === hours && Math.abs(currentMinute - minutes) <= 5;
};

// Function to manually trigger notifications for testing
export const triggerNotificationsNow = async (habitId?: string): Promise<{ sent: number, total: number }> => {
  let query = {};
  
  if (habitId) {
    query = { _id: habitId, reminderTime: { $exists: true, $ne: null } };
  } else {
    query = { reminderTime: { $exists: true, $ne: null } };
  }
  
  const habits = await HabitModel.find(query);
  let sentCount = 0;
  
  for (const habit of habits) {
    const { _id, name, userEmail, question } = habit;
    const id = String(_id);
    
    try {
      await sendPushNotification(userEmail, id, name, question);
      sentCount++;
    } catch (error) {
      console.error(`Failed to send notification for habit "${name}":`, error);
    }
  }
  
  return { sent: sentCount, total: habits.length };
};