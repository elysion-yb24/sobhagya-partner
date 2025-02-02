import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import Kyc from "@/models/kyc";
import checkAdminAuth from "@/middlewares/checkAdminAuth";

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    await dbConnect();

    // 1) Find the Astrologer
    const astrologer = await Astrologer.findById(id);
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found." });
    }

    // 2) Mark the astrologer as KYC done (or "onboarded")
    // This might be the final stage of the leadStatus pipeline
    astrologer.isKycDone = true;
    astrologer.leadStatus = "onboarded"; // e.g. "onboarded" after successful verification
    await astrologer.save();

    // 3) (Optional) If you want to mark something in KYC or ensure page4 is filled
    const kycRecord = await Kyc.findOne({ astrologerId: id });
    if (kycRecord) {
      // If you want to enforce page4: kycRecord.page4Filled = true;
      // There's no explicit 'rejectionReason' or 'validationStatus' field,
      // so we might just rely on the Astrologer 'isKycDone' + leadStatus
      await kycRecord.save();
    }

    return res.status(200).json({
      success: true,
      message: `Astrologer ${id} has been validated and onboarded.`,
    });
  } catch (error) {
    console.error("Error validating astrologer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export default checkAdminAuth(handler);
