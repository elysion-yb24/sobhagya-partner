import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import Kyc from "@/models/kyc";
import checkAdminAuth from "@/middlewares/checkAdminAuth";

async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    await dbConnect();

    // 1) Fetch astrologer by ID
    const astrologer = await Astrologer.findById(id);
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found." });
    }

    // 2) Fetch KYC record for this astrologer
    const kycRecord = await Kyc.findOne({ astrologerId: id });

    return res.status(200).json({
      success: true,
      data: {
        astrologer,
        kyc: kycRecord,
      },
    });
  } catch (error) {
    console.error("Error fetching single astrologer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

export default checkAdminAuth(handler);
