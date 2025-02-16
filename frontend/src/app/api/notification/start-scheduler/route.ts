import { NextResponse } from "next/server";
import { scheduleNotifications } from "@/utils/notification/notificationScheduler";

export async function POST() {
  try {
    await scheduleNotifications();
    return NextResponse.json({ message: "✅ Notification scheduler started!" });
  } catch (error) {
    return NextResponse.json({ message: "❌ Error starting scheduler", error }, { status: 500 });
  }
}