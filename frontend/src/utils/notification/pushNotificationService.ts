import webpush from "web-push";
import User from "@/models/User";
import NotificationLog from "@/models/NotificationLog";

const VAPID_KEYS = {
  publicKey: "BOMxWltad74aktHYDh_E0pMxs8kH2maU0tbS4MuEwI-BM_dibL1xcu66pQ5FXD6G9v0gfgHyNBWwyyGl5hRZsQI",
  privateKey: "dV-qETfpjK5VOL9bonAWrC3y0F0zdsyVKtCDhZuXPOI",
};

webpush.setVapidDetails(
  "mailto:narjesdavari0@gmail.com",
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

// ✅ Track notifications per habit instead of per user
const sentNotifications: { [key: string]: string } = {};


export const clearSentNotification = async (habitId: string): Promise<void> => {
  // Delete notification logs for this habit
  await NotificationLog.deleteMany({ habitId });
  console.log(`🔄 Resetting notification tracking for habit ID: ${habitId}`);
};

export const sendPushNotification = async (userEmail: string, habitId: string, title: string, message: string): Promise<void> => {
  console.log("📌 Sending push notification to user with email:", userEmail);

  if (!userEmail) {
    console.error("❌ Missing userEmail in sendPushNotification!");
    return;
  }

  const user = await User.findOne({ email: userEmail });

  if (!user || !user.pushSubscription) {
    console.error(`❌ User not found or no subscription: ${userEmail}`);
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  
  // Check if notification was already sent today (from database)
  const existingLog = await NotificationLog.findOne({
    habitId,
    userEmail,
    sentDate: today
  });

  if (existingLog) {
    console.log(`⏳ Notification for ${title} (User: ${userEmail}) already sent today, skipping...`);
    return;
  }

  const payload = JSON.stringify({ title, body: message });

  try {
    await webpush.sendNotification(user.pushSubscription, payload);
    console.log(`✅ Push notification for "${title}" sent successfully!`);
    
    // Log the sent notification to database
    await NotificationLog.create({
      habitId,
      userEmail,
      sentDate: today
    });
    
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
   
    if (error instanceof webpush.WebPushError && (error.statusCode === 410 || error.statusCode === 404)) {
      console.log(`Subscription for user ${userEmail} is invalid. Removing it.`);
      await User.findOneAndUpdate({ email: userEmail }, { $unset: { pushSubscription: "" } });
    }
  }
};