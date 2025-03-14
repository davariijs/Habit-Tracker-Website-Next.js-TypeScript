// app/api/notification/save-subscription/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/utils/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
    try {
        await connectMongo();
        
        // Get data from request
        const data = await request.json();
        const { subscription, email } = data;
        
        // Validate required data
        if (!subscription) {
            return NextResponse.json(
                { success: false, message: "No subscription provided" },
                { status: 400 }
            );
        }
        
        if (!email) {
            return NextResponse.json(
                { success: false, message: "No email provided" },
                { status: 400 }
            );
        }
        
        console.log(`Saving push subscription for user: ${email}`);
        
        // Make sure the subscription object has expired property set to false
        const subscriptionWithExpiredFlag = {
            ...subscription,
            expired: false
        };
        
        // Update user with new subscription (only set the whole object)
        const result = await User.findOneAndUpdate(
            { email },
            { 
                $set: { 
                    pushSubscription: subscriptionWithExpiredFlag
                } 
            },
            { new: true }
        );
        
        if (!result) {
            console.log(`User not found: ${email}`);
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        
        console.log(`✅ Successfully saved subscription for: ${email}`);
        
        return NextResponse.json(
            { success: true, message: "Subscription saved successfully" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Error saving subscription:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}