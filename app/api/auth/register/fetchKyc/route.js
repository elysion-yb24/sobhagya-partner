import connectDB from "@/config/db";
import Kyc from "@/models/kyc";
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

    
    
    // Fetch KYC details only
    const astrologerKYC = await Kyc.findOne({ astrologerId: astrologerId }).select(
        "page1Filled page2Filled page3Filled page4Filled kycNotification"
    );
    

    return new Response(
      JSON.stringify({
        success: true,
        kycDetails: astrologerKYC
          ? {
              page1Filled: astrologerKYC.page1Filled || false,
              page2Filled: astrologerKYC.page2Filled || false,
              page3Filled: astrologerKYC.page3Filled || false,
              page4Filled: astrologerKYC.page4Filled || false,
              kycNotification: astrologerKYC.kycNotification || null,
            }
          : null, // If KYC doesn't exist, return null
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching KYC details:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
