import mongoose from "mongoose";
import Astrologer from "@/models/astrologer";
import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Verify the token and extract astrologer ID
    const astrologerId = verifyToken(token);
    if (!astrologerId) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401 }
      );
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Fetch astrologer details from DB
    const astrologer = await Astrologer.findById(astrologerId);

    if (!astrologer) {
      return new Response(
        JSON.stringify({ success: false, error: "Astrologer not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        interviewStatus: astrologer.interviewStatus,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500 }
    );
  }
}
