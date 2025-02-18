import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectMongo(); // Connect to MongoDB

    console.log("📝 Incoming request:", req);

    const body = await req.json();
    console.log("📌 Parsed body:", body);

    const { subscription, email  } = body;
    console.log("📌 Received subscription request:", { email, subscription });

    if (!subscription || !email) {
      return NextResponse.json({ message: "Missing subscription or email" }, { status: 400 });
    }


    const user = await User.findOneAndUpdate(
      { email: email }, 
      { pushSubscription: subscription }, 
      { new: true }
    );

    if (!user) {
      console.error("❌ No user found with email:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "✅ Subscription saved successfully!" });
  } catch (error) {
    console.error("❌ Error parsing request:", error);
    return NextResponse.json({ message: "❌ Error saving subscription", error }, { status: 500 });
  }
}