import webpush from "web-push";
import User from "@/models/User";
import NotificationLog from "@/models/NotificationLog";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT as string,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);


export async function clearSentNotification(habitId: string) {
  try {
    console.log(`🔄 Clearing previous notification logs for habit ID: ${habitId}`);
    const deleted = await NotificationLog.deleteMany({ habitId });
    console.log(`✅ Cleared ${deleted.deletedCount} notification logs`);
    return deleted;
  } catch (error) {
    console.error(`❌ Error clearing notification logs: ${error}`);
    throw error;
  }
}

export const sendPushNotification = async (userEmail: string, habitId: string, title: string, message: string): Promise<void> => {
  if (!userEmail) {
      console.error("❌ Missing userEmail in sendPushNotification!");
      return;
  }

  const user = await User.findOne({ email: userEmail });

  if (!user || !user.pushSubscription || user.pushSubscription.expired) {
      console.error(`❌ User not found or subscription invalid: ${userEmail}`);
      return;
  }

  const today = new Date().toISOString().split("T")[0];

  const existingLog = await NotificationLog.findOne({
      habitId,
      userEmail,
      sentDate: today
  });

  if (existingLog) {
      return;
  }

  const payload = JSON.stringify({ title, body: message });

  try {
      await webpush.sendNotification(user.pushSubscription, payload);
      
      await NotificationLog.create({ habitId, userEmail, sentDate: today });

  } catch (error: any) {
      console.error("❌ Error sending push notification:", error);
  }
};