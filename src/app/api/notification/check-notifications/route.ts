import { NextResponse } from "next/server";
import HabitModel from "@/models/Habit";
import { sendPushNotification } from "@/utils/notification/pushNotificationService";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get all habits with reminder times
    const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Process habits due for notification
    const notifications = habits.map(async (habit) => {
      const { reminderTime, _id, name, userEmail, question } = habit;
      const habitId = String(_id);
      
      if (!reminderTime) return null;
      
      let habitHour, habitMinute;
      
      // Parse reminder time
      if (typeof reminderTime === 'string' && /^\d{1,2}:\d{2}$/.test(reminderTime)) {
        const [hoursStr, minutesStr] = reminderTime.split(':');
        habitHour = parseInt(hoursStr, 10);
        habitMinute = parseInt(minutesStr, 10);
      } else {
        try {
          const reminderDate = new Date(reminderTime);
          if (!isNaN(reminderDate.getTime())) {
            habitHour = reminderDate.getHours();
            habitMinute = reminderDate.getMinutes();
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      }
      
      // Check if it's time to send a notification (allow 5 minute window)
      if (habitHour === currentHour && Math.abs(habitMinute - currentMinute) <= 5) {
        return sendPushNotification(userEmail, habitId, name, question);
      }
      
      return null;
    });
    
    await Promise.all(notifications.filter(Boolean));
    
    return NextResponse.json({ success: true, message: "Notifications checked" });
  } catch (error) {
    console.error("Error checking notifications:", error);
    return NextResponse.json({ success: false, error: "Failed to check notifications" }, { status: 500 });
  }
}