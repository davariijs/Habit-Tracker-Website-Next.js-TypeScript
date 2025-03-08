import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";
import HabitModel from "@/models/Habit";
import NotificationLog from "@/models/NotificationLog";
import { getServerSession } from "next-auth/next";
import authConfig from "@/lib/auth.config";

export async function DELETE(req: Request) {
  try {

    const session = await getServerSession(authConfig);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userEmail = session.user.email;
    await connectMongo();
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    
    await HabitModel.deleteMany({ userEmail });
    await NotificationLog.deleteMany({ userEmail });
    await User.deleteOne({ email: userEmail });
    
    return NextResponse.json({
      message: "Account successfully deleted"
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { message: "Error deleting account", error },
      { status: 500 }
    );
  }
}