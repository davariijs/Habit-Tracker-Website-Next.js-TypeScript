// app/api/notification/vapid-public-key/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Your VAPID public key should be stored in environment variables
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  if (!publicKey) {
    return NextResponse.json(
      { error: "VAPID public key not configured" }, 
      { status: 500 }
    );
  }
  
  return NextResponse.json({ publicKey });
}