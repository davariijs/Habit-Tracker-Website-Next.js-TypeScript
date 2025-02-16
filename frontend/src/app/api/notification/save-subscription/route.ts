import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";
import { isValidObjectId, ObjectId } from "mongoose";

export async function POST(req: Request) {
  try {
    await connectMongo(); // Connect to MongoDB

    const { subscription, userId } = await req.json();

    if (!subscription || !userId) {
      return NextResponse.json({ message: "Missing subscription or userId" }, { status: 400 });
    }

    // if (!isValidObjectId(userId)) {
    //   return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    // }


    // Save subscription in the database
    await User.findByIdAndUpdate(userId, { pushSubscription: subscription });

    return NextResponse.json({ message: "✅ Subscription saved successfully!" });
  } catch (error) {
    return NextResponse.json({ message: "❌ Error saving subscription", error }, { status: 500 });
  }
}