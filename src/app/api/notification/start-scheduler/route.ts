import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ message: "✅ Using client-side notification checking!" });
  } catch (error) {
    return NextResponse.json({ message: "❌ Error", error }, { status: 500 });
  }
}