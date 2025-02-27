import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
// import Kyc from "@/models/kyc";
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

    // 2) Mark them as KYC not done, leadStatus = "rejected"
    // astrologer.isKycDone = false;
    astrologer.leadStatus = "rejected";
    await astrologer.save();

    // 3) If you need to store a reason or notification, you can do so in Kyc
    // const kycRecord = await Kyc.findOne({ astrologerId: id });
    // if (kycRecord) {
    //   // If you had a 'rejectionReason' field, you'd store it here:
    //   // kycRecord.rejectionReason = req.body.reason || "Details could not be validated";
    //   // but since your Kyc schema doesn't have it, we skip that step
    //   await kycRecord.save();
    // }

    // 4) On the frontend, the astrologer will see they have 'leadStatus = "rejected"'
    // and you can show them a notification: "Details could not be validated; please contact support."

    return res.status(200).json({
      success: true,
      message: `Astrologer ${id} has been rejected.`,
    });
  } catch (error) {
    console.error("Error rejecting astrologer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export default checkAdminAuth(handler);
