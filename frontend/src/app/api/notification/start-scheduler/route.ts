import { NextResponse } from "next/server";
import { scheduleNotifications } from "@/utils/notification/notificationScheduler";

let schedulerStarted = false; // ✅ Prevent multiple scheduler starts

export async function POST() {
  try {
    if (schedulerStarted) {
      console.log("⏳ Scheduler already started, skipping...");
      return NextResponse.json({ message: "✅ Scheduler already running!" });
    }

    schedulerStarted = true; // ✅ Mark as started
    await scheduleNotifications();
    
    return NextResponse.json({ message: "✅ Notification scheduler started!" });
  } catch (error) {
    return NextResponse.json({ message: "❌ Error starting scheduler", error }, { status: 500 });
  }
}