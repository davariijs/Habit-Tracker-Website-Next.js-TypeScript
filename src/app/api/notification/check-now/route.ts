import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import HabitModel from "@/models/Habit";
import User from "@/models/User";
import NotificationLog from "@/models/NotificationLog";
import { getCurrentUtcTime, formatTime } from "@/utils/notification/time";
import webpush from "web-push";

export async function POST() {
    try {
        await connectMongo();

        // ✅ Set up WebPush VAPID keys
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT as string,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
            process.env.VAPID_PRIVATE_KEY as string
        );

        // ✅ Get current UTC time
        const currentUtcTime = getCurrentUtcTime();
        console.log(`🔍 Checking notifications at ${currentUtcTime}`);

        // ✅ Fetch all habits with a reminder time
        const habits = await HabitModel.find({ reminderTime: { $exists: true, $ne: null } });

        let sentCount = 0;
        const results = [];

        for (const habit of habits) {
            const { reminderTime, _id, name, userEmail, question } = habit;
            const habitId = String(_id);

            if (!reminderTime) continue;

            // ✅ Ensure reminder time is always `HH:mm`
            const formattedReminderTime = formatTime(reminderTime);

            console.log(`Habit "${name}" reminder time: ${formattedReminderTime}, Current UTC time: ${currentUtcTime}`);

            // ✅ Exact time match (No ±5 min offset)
            if (formattedReminderTime !== currentUtcTime) {
                console.log(`❌ Habit "${name}" time does not match.`);
                results.push({ habitId, name, sent: false, reason: "Not time for reminder yet" });
                continue;
            }

            // ✅ Prevent duplicate notifications
            const today = new Date().toISOString().split("T")[0];
            const alreadySent = await NotificationLog.findOne({ habitId, userEmail, sentDate: today });

            if (alreadySent) {
                console.log(`⚠️ Already sent notification for "${name}" today`);
                results.push({ habitId, name, sent: false, reason: "Already sent today" });
                continue;
            }

            // ✅ Get user subscription
            const user = await User.findOne({ email: userEmail });


            console.log(`📱 Push subscription for ${userEmail}:`, 
                user.pushSubscription ? 'Found' : 'Not found', 
                user.pushSubscription?.expired ? '(Expired)' : '');

            if (!user || !user.pushSubscription) {
                console.log(`🚫 User ${userEmail} has no push subscription`);
                results.push({ habitId, name, sent: false, reason: "No push subscription" });
                continue;
            }

            try {
                // ✅ Save notification log BEFORE sending
                await NotificationLog.create({ habitId, userEmail, sentDate: today });

                // ✅ Send push notification
                const payload = JSON.stringify({
                    title: name,
                    body: question || "Time to track your habit!",
                    habitId: habitId,
                });

                await webpush.sendNotification(user.pushSubscription, payload);
                console.log(`✅ Notification sent for habit "${name}" to ${userEmail}`);


                console.log('Attempting to send notification with payload:', payload);
                const result = await webpush.sendNotification(user.pushSubscription, payload);
                console.log('Push notification result:', result);
                console.log(`✅ Notification sent for habit "${name}" to ${userEmail}`);

                sentCount++;
                results.push({ habitId, name, sent: true });
            } catch (error: any) {
                console.error(`❌ Error sending notification for habit "${name}":`, error);
                console.error(`❌ Detailed error sending notification:`, error);

                // ✅ Mark subscription as expired if needed
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await User.findOneAndUpdate(
                        { email: userEmail },
                        { $set: { "pushSubscription.expired": true } }
                    );
                }

                results.push({ habitId, name, sent: false, reason: `Error: ${error.message}` });
            }
        }

        console.log(`✅ Sent ${sentCount} notifications out of ${habits.length} habits`);

        return NextResponse.json(
            { success: true, total: habits.length, sent: sentCount, results },
            {
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            }
        );
    } catch (error: any) {
        console.error("❌ Error checking notifications:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            {
                status: 500,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            }
        );
    }
}