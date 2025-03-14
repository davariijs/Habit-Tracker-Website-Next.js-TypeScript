// Create a new endpoint for testing notifications
// app/api/notification/test-push/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";
import webpush from "web-push";

export async function POST(request: NextRequest) {
  try {
    await connectMongo();
    const { email } = await request.json();
    
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT as string,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );
    
    const user = await User.findOne({ email });
    if (!user || !user.pushSubscription) {
      return NextResponse.json({ success: false, message: "No push subscription found" });
    }
    
    const payload = JSON.stringify({
      title: "Test Notification",
      body: "This is a test notification",
    });
    
    await webpush.sendNotification(user.pushSubscription, payload);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}