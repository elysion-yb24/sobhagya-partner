import { NextResponse } from "next/server";
import dbConnect from "@/config/db"; // Your MongoDB connection helper
import Astrologer from "@/models/astrologer"; // The Astrologer model defined in your snippet
import { cookies } from "next/headers"; // For token from cookies
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    // 1️⃣ Connect to the database
    await dbConnect();

    // 2️⃣ Extract token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Verify JWT & extract astrologerId (or userId)
    let astrologerId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      astrologerId = decoded.userId || decoded.astrologerId;
      // Adjust if your token payload uses a different key
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 403 });
    }

    // 4️⃣ Fetch astrologer from DB
    const astrologer = await Astrologer.findById(astrologerId).lean();
    if (!astrologer) {
      return NextResponse.json({ success: false, message: "Astrologer not found" }, { status: 404 });
    }

    // 5️⃣ Return name & phone
    return NextResponse.json({
      success: true,
      name: astrologer.name || "",
      phone: astrologer.phone || "",
    });
  } catch (error) {
    console.error("Error in GET /api/user-details:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
