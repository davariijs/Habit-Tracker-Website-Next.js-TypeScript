import { NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Missing email parameter" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found", expired: true }, { status: 404 });
    }

    return NextResponse.json({ expired: !user.pushSubscription || user.pushSubscription.expired });
  } catch (error) {
    console.error("❌ Error checking subscription status:", error);
    return NextResponse.json({ message: "Internal server error", error }, { status: 500 });
  }
}