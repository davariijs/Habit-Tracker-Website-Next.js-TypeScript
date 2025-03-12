import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectMongo();

    const body = await req.json();
    const { subscription, email  } = body;

    if (!subscription || !email) {
      return NextResponse.json({ message: "Missing subscription or email" }, { status: 400 });
    }


    const user = await User.findOneAndUpdate(
      { email: email }, 
      { pushSubscription: { ...subscription, expired: false } },
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