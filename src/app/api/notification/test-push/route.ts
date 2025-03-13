// app/api/notification/test-push/route.ts
import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";
import webpush from "web-push";

export async function POST(req: Request) {
  try {
    console.log("Test notification endpoint called");
    await connectMongo();
    
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }
    
    console.log("Setting VAPID details");
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT as string,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );
    
    console.log("Finding user:", email);
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" }, 
        { status: 404 }
      );
    }
    
    if (!user.pushSubscription) {
      return NextResponse.json(
        { success: false, error: "User has no push subscription" }, 
        { status: 404 }
      );
    }
    
    console.log("User found with subscription:", user.pushSubscription);
    
    // Send a test notification
    const payload = JSON.stringify({
      title: "Test Notification",
      body: "This is a test notification from your habit tracker!"
    });
    
    console.log("Sending notification with payload:", payload);
    const result = await webpush.sendNotification(user.pushSubscription, payload);
    
    console.log("Notification sent with result:", result.statusCode);
    
    return NextResponse.json({ 
      success: true, 
      message: "Test notification sent successfully",
      statusCode: result.statusCode
    });
  } catch (error: any) {
    console.error("Error sending test notification:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}