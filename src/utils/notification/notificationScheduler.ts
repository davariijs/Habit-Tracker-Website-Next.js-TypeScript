// utils/notification/notificationScheduler.ts
import HabitModel, { IHabit } from "@/models/Habit";
import { sendPushNotification } from "./pushNotificationService";
import { formatTime, getCurrentUtcTime } from "./time";
import NotificationLog from "@/models/NotificationLog";

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
export const shouldSendNotificationNow = async (habit: IHabit): Promise<boolean> => {
  const { reminderTime, name, _id, userEmail } = habit;

  if (!reminderTime) return false;

  const formattedTime = formatTime(reminderTime);
  const currentUtcTime = getCurrentUtcTime();

  console.log(`📌 Checking habit "${name}" (ID: ${_id})`);
  console.log(`💡 Stored Reminder Time (UTC): ${formattedTime}`);
  console.log(`💡 Current Server UTC Time: ${currentUtcTime}`);

  if (formattedTime === currentUtcTime) {
      console.log(`⏰ Time matched for habit "${name}" at ${currentUtcTime}`);

      // Prevent duplicate notifications
      const today = new Date().toISOString().split("T")[0];
      const alreadySent = await NotificationLog.findOne({
          habitId: _id,
          userEmail,
          sentDate: today
      });

      if (alreadySent) {
          console.log(`⚠️ Already sent notification for "${name}" today`);
          return false;
      }

      return true;
  }

  console.log(`❌ Time did not match for habit "${name}"`);
  return false;
};


// Trigger notifications manually
export const triggerNotificationsNow = async (): Promise<{ sent: number, total: number }> => {
  const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });
  let sentCount = 0;

  for (const habit of habits) {
      if (await shouldSendNotificationNow(habit)) {
          const { _id, name, userEmail, question } = habit;

          try {
              await sendPushNotification(userEmail, String(_id), name, question);
              sentCount++;

              // Log the notification
              await NotificationLog.create({
                  habitId: _id,
                  userEmail,
                  sentDate: new Date().toISOString().split("T")[0]
              });

          } catch (error) {
              console.error(`❌ Failed to send notification for habit "${name}":`, error);
          }
      }
  }

  return { sent: sentCount, total: habits.length };
};