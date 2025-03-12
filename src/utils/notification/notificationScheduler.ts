import schedule from "node-schedule";
import HabitModel, { IHabit } from "@/models/Habit";
import { sendPushNotification } from "./pushNotificationService";

export const scheduleNotifications = async (): Promise<void> => {
  const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });


  Object.keys(schedule.scheduledJobs).forEach((jobName) => {
    schedule.scheduledJobs[jobName].cancel();
  });

  habits.forEach((habit) => {
    const { reminderTime, _id, name, userEmail, question } = habit;
    const habitId = String(_id);

    if (!reminderTime) return;
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
          console.error(`❌ Could not parse time for habit "${name}": ${reminderTime}`);
          return;
        }
      } catch (error) {
        console.error(`❌ Error parsing time for habit "${name}":`, error);
        return;
      }
    }
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error(`❌ Invalid time values for habit "${name}": hours=${hours}, minutes=${minutes}`);
      return;
    }
    
    
    const rule = new schedule.RecurrenceRule();
    rule.hour = hours;
    rule.minute = minutes;
    
    schedule.scheduleJob(habitId, rule, async () => {
      await sendPushNotification(userEmail, habitId, name, question);
    });
  });
};