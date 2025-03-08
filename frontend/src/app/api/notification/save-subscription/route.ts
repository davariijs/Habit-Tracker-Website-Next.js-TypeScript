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


// // app/api/notification/subscribe/route.ts
// import { NextResponse } from "next/server";
// import connectMongo from "@/utils/db";
// import User from "@/models/User";
// import { getServerSession } from "next-auth";
// import authConfig from '@/lib/auth.config';

// export async function POST(req: Request) {
//   try {
//     // Check authentication
//     const session = await getServerSession(authConfig);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Connect to database
//     await connectMongo();
    
//     // Get subscription from request
//     const { subscription } = await req.json();
    
//     // Update user with subscription
//     const result = await User.findOneAndUpdate(
//       { email: session.user.email },
//       { pushSubscription: subscription },
//       { new: true }
//     );
    
//     if (!result) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }
    
//     return NextResponse.json({ success: true });
//   } catch (error:any) {
//     console.error("Error saving subscription:", error);
//     return NextResponse.json({ 
//       error: "Failed to save subscription",
//       details: error.message 
//     }, { status: 500 });
//   }
// }