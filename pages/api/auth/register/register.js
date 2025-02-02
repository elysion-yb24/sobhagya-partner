// pages/api/kyc/checkProgress.js
import connectDB from "@/config/db";
import Kyc from "@/models/kyc";
import validateJWT from "@/middlewares/jwtValidation";

connectDB();

async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed." });
  }

  try {
    // Retrieve the user's KYC record using the astrologerId from the JWT
    const kycRecord = await Kyc.findOne({ astrologerId: req.astrologerId });

    // Determine which page to go to next
    let nextRoute = "/auth/kyc/page1"; // Default if none of the pages are filled
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

    return res.status(200).json({
      success: true,
      nextRoute,
    });
  } catch (error) {
    console.error("Error checking KYC progress:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

// Wrap with validateJWT so req.astrologerId is available
export default (req, res) => validateJWT(req, res, () => handler(req, res));
