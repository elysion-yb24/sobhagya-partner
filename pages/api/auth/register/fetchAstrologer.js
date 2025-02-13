import db from "@/config/db"; // Ensure you have a database connection utility
import Astrologer from "@/models/astrologer";
import validateJWT from "@/middlewares/jwtValidation";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    // Connect to database
    await db();

    // Validate JWT token and extract astrologer ID
    await new Promise((resolve, reject) => validateJWT(req, res, (err) => (err ? reject(err) : resolve())));

    // Fetch astrologer details using astrologerId
    const astrologer = await Astrologer.findById(req.astrologerId).select("name interviewStatus videoPrice audioPrice");

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found.",
      });
    }

    // Return astrologer details
    return res.status(200).json({
      success: true,
      data: {
        name: astrologer.name,
        videoPrice: astrologer.videoPrice || "Not Decided",
        audioPrice: astrologer.audioPrice || "Not Decided",
        interviewStatus: astrologer.interviewStatus || "Pending"
      },
    });
  } catch (error) {
    console.error("Error fetching astrologer details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
