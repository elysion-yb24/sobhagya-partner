import mongoose from "mongoose";
import Astrologer from "@/models/astrologer";
import { verifyToken } from "@/utils/verifyToken";
import { cookies } from "next/headers";

/**
 * Force dynamic usage so Next.js never tries static generation.
 * This also disables any caching or revalidation attempts.
 */
export const dynamic = "force-dynamic";     // Tells Next.js this route is dynamic
export const revalidate = 0;               // Disables ISR
export const fetchCache = "force-no-store"; // Prevents caching

export async function GET() {
  try {
    console.log("Inside /api/auth/register/astrologerStatus");

    // 1) Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // 2) Verify the token and extract astrologer ID
    const astrologerId = verifyToken(token);
    if (!astrologerId) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401 }
      );
    }

    // 3) Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // 4) Fetch astrologer details
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return new Response(
        JSON.stringify({ success: false, error: "Astrologer not found" }),
        { status: 404 }
      );
    }

    // 5) Return interviewStatus
    return new Response(
      JSON.stringify({
        success: true,
        interviewStatus: astrologer.interviewStatus
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching astrologer details:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500 }
    );
  }
}
