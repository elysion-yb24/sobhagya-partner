import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import checkAdminAuth from "@/middlewares/checkAdminAuth"; // <--- Placeholder admin auth

// GET /api/admin/astrologers
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    await dbConnect();

    // Optionally add pagination or filters
    const astrologers = await Astrologer.find({});

    return res.status(200).json({
      success: true,
      data: astrologers,
    });
  } catch (error) {
    console.error("Error fetching astrologers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// Wrap the handler with admin auth so only admins can access it
export default checkAdminAuth(handler);
