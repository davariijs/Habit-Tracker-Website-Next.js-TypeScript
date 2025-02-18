import webpush from "web-push";
import User from "@/models/User";
const VAPID_KEYS = {
  publicKey: "BOMxWltad74aktHYDh_E0pMxs8kH2maU0tbS4MuEwI-BM_dibL1xcu66pQ5FXD6G9v0gfgHyNBWwyyGl5hRZsQI",
  privateKey: "dV-qETfpjK5VOL9bonAWrC3y0F0zdsyVKtCDhZuXPOI",
};

webpush.setVapidDetails(
  "mailto:narjesdavari0@gmail.com",
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

export const sendPushNotification = async (userEmail: string, title: string, message: string) => {
  console.log("📌 Sending push notification to user with email:", userEmail);

  if (!userEmail) {
    console.error("❌ Missing userEmail in sendPushNotification!");
    return;
  }

  // ✅ Query by email instead of _id
  const user = await User.findOne({ email: userEmail });

  console.log("🔍 Found user:", user);

  if (!user) {
    console.error(`❌ User not found with email: ${userEmail}`);
    return;
  }

  if (!user.pushSubscription) {
    console.error(`❌ No push subscription found for user: ${userEmail}`);
    return;
  }

  const payload = JSON.stringify({ title, body: message });

  try {
    await webpush.sendNotification(user.pushSubscription, payload);
    console.log("✅ Push notification sent successfully!");
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
    
    if (error instanceof webpush.WebPushError) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`Subscription for user ${userEmail} is no longer valid. Removing it.`);
        await User.findOneAndUpdate({ email: userEmail }, { $unset: { pushSubscription: "" } });
      } else {
        console.error("WebPushError:", error.statusCode, error.body, error.headers);
      }
    }
  }
};