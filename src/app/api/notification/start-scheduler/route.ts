import { NextResponse } from "next/server";
import { scheduleNotifications } from "@/utils/notification/notificationScheduler";

let schedulerStarted = false;

export async function POST() {
  try {
    if (schedulerStarted) {
      return NextResponse.json({ message: "✅ Scheduler already running!" });
    }

    schedulerStarted = true;
    await scheduleNotifications();
    
    return NextResponse.json({ message: "✅ Notification scheduler started!" });
  } catch (error) {
    return NextResponse.json({ message: "❌ Error starting scheduler", error }, { status: 500 });
  }
}