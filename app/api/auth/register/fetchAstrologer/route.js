import connectDB from "@/config/db";
import Astrologer from "@/models/astrologer";
import validateJWT from "@/middlewares/jwtValidation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";


export async function GET() {
  try {
    await connectDB();

    // Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Validate JWT and get astrologer ID
    const astrologerId = await validateJWT(token).catch((error) => {
      console.error("JWT validation error:", error.message);
      return null;
    });

    if (!astrologerId) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token." }),
        { status: 403 }
      );
    }

    // Fetch astrologer details
    const astrologer = await Astrologer.findById(astrologerId).select(
      "name interviewStatus videoPrice audioPrice"
    );

    if (!astrologer) {
      return new Response(
        JSON.stringify({ success: false, message: "Astrologer not found." }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name: astrologer.name,
          videoPrice: astrologer.videoPrice || "Not Decided",
          audioPrice: astrologer.audioPrice || "Not Decided",
          interviewStatus: astrologer.interviewStatus || "Pending",
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching astrologer details:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
