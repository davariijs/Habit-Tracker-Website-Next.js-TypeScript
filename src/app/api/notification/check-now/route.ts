// app/api/notification/check-now/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import HabitModel from "@/models/Habit";
import User from "@/models/User";
import NotificationLog from "@/models/NotificationLog";
import webpush from "web-push";

export async function POST() {
  try {
    await connectMongo();
    
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT as string,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );

    // Get all habits with reminder times
    const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });
    console.log(`Found ${habits.length} habits with reminder times`);
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    
    console.log(`Current time: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
    
    let sentCount = 0;
    const results = [];
    
    // Process each habit sequentially to avoid race conditions
    for (const habit of habits) {
      const { reminderTime, _id, name, userEmail, question } = habit;
      const habitId = String(_id);
      
      // Skip if no reminder time
      if (!reminderTime) continue;
      
      // Parse reminder time
      let habitHour = 0;
      let habitMinute = 0;
      let reminderTimeStr = '';
      
      try {
        if (typeof reminderTime === 'string' && /^\d{1,2}:\d{2}$/.test(reminderTime)) {
          // Format: "HH:MM"
          const [hoursStr, minutesStr] = reminderTime.split(':');
          habitHour = parseInt(hoursStr, 10);
          habitMinute = parseInt(minutesStr, 10);
          reminderTimeStr = `${habitHour.toString().padStart(2, '0')}:${habitMinute.toString().padStart(2, '0')}`;
        } else {
          // Try as Date object
          const reminderDate = new Date(reminderTime);
          if (!isNaN(reminderDate.getTime())) {
            habitHour = reminderDate.getHours();
            habitMinute = reminderDate.getMinutes();
            reminderTimeStr = `${habitHour.toString().padStart(2, '0')}:${habitMinute.toString().padStart(2, '0')}`;
          } else {
            console.log(`Invalid reminder time format for habit "${name}": ${reminderTime}`);
            continue;
          }
        }
      } catch (error) {
        console.log(`Error parsing reminder time for habit "${name}": ${reminderTime}`);
        continue;
      }
      
      // Debug log
      console.log(`Habit "${name}" reminder time: ${reminderTimeStr}, Current time: ${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`);
      
      // Check if we're within the reminder window (±5 minutes)
      const timeMatch = habitHour === currentHour && 
                         Math.abs(habitMinute - currentMinute) <= 5;
      
      if (!timeMatch) {
        console.log(`Habit "${name}" time doesn't match current time`);
        results.push({ habitId, name, sent: false, reason: "Not time for reminder yet" });
        continue;
      }
      
      console.log(`⏰ Time matched for habit "${name}" at ${reminderTimeStr}`);
      
      // Check if already sent today
      const existingLog = await NotificationLog.findOne({
        habitId,
        userEmail,
        sentDate: today
      });
      
      if (existingLog) {
        console.log(`Already sent notification for habit "${name}" today`);
        results.push({ habitId, name, sent: false, reason: "Already sent today" });
        continue;
      }
      
      // Get user subscription
      const user = await User.findOne({ email: userEmail });
      
      if (!user || !user.pushSubscription) {
        console.log(`User ${userEmail} not found or has no push subscription`);
        results.push({ habitId, name, sent: false, reason: "No push subscription" });
        continue;
      }
      
      try {
        // First save notification log to prevent duplicates
        const logEntry = new NotificationLog({
          habitId,
          userEmail,
          sentDate: today
        });
        await logEntry.save();
        
        // Send the notification
        const payload = JSON.stringify({
          title: name,
          body: question || "Time to track your habit!",
          habitId: habitId
        });
        
        await webpush.sendNotification(user.pushSubscription, payload);
        console.log(`✅ Notification sent for habit "${name}" to ${userEmail}`);
        
        sentCount++;
        results.push({ habitId, name, sent: true });
      } catch (error: any) {
        console.error(`Error sending notification for habit "${name}":`, error);
        
        // Mark subscription as expired if needed
        if (error.statusCode === 410 || error.statusCode === 404) {
          await User.findOneAndUpdate(
            { email: userEmail },
            { $set: { "pushSubscription.expired": true } }
          );
        }
        
        results.push({ 
          habitId, 
          name,
          sent: false, 
          reason: `Error: ${error.message}`
        });
      }
    }
    
    console.log(`Sent ${sentCount} notifications out of ${habits.length} habits`);
    
    // Return response with cache control headers
    return NextResponse.json(
      { 
        success: true, 
        total: habits.length,
        sent: sentCount,
        results
      }, 
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error: any) {
    console.error("Error checking notifications:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      }, 
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}