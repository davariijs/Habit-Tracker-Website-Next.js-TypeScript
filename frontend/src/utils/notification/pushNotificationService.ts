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

export const sendPushNotification = async (userId: string, title: string, message: string) => {
  const user = await User.findById(userId);

  if (!user || !user.pushSubscription) {
    console.log(`❌ No push subscription found for user: ${userId}`);
    return;
  }

  const payload = JSON.stringify({ title, body: message });

  try {
    await webpush.sendNotification(user.pushSubscription, payload);
    console.log("✅ Push notification sent!");
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
};