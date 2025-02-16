import db from "@/config/db"; // Ensure database connection
import Astrologer from "@/models/astrologer"; // Import astrologer model
import validateJWT from "@/middlewares/jwtValidation"; // Import JWT validation middleware

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
    const astrologer = await Astrologer.findById(req.astrologerId).select("name");

    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found.",
      });
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

    // Return astrologer details and today's date
    return res.status(200).json({
      success: true,
      data: {
        name: astrologer.name,
        date: today,
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
