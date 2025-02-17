import connectDB from "@/config/db";
import Kyc from "@/models/kyc";
import validateJWT from "@/middlewares/jwtValidation";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();
    console.log("Database connected successfully in /api/auth/kyc/progress");

    // ✅ Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    // ✅ Validate JWT and extract astrologerId
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

    // ✅ Retrieve the user's KYC record
    const kycRecord = await Kyc.findOne({ astrologerId });
    console.log("Checking KYC for astrologerId:", astrologerId, kycRecord);

    // ✅ Determine the next KYC step (updated to match `/auth/kyc/` folder structure)
    let nextRoute = "/auth/kyc/page1"; // Default if no pages are filled
    if (kycRecord) {
      if (kycRecord.page4Filled) {
        nextRoute = "/auth/kyc/page5";
      } else if (kycRecord.page3Filled) {
        nextRoute = "/auth/kyc/page4";
      } else if (kycRecord.page2Filled) {
        nextRoute = "/auth/kyc/page3";
      } else if (kycRecord.page1Filled) {
        nextRoute = "/auth/kyc/page2";
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        nextRoute,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking KYC progress:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500 }
    );
  }
}
