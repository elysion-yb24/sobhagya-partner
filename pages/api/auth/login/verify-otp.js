import connectDb from "@/config/db"; 
import OTP from "@/models/otp"; 
import Session from "@/models/session"; 
import Astrologer from "@/models/astrologer"; 
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: "Phone and OTP are required" });
  }

  try {
    // Connect to the database
    await connectDb();

    // Fetch the OTP entry
    const otpEntry = await OTP.findOne({ phone });
    if (!otpEntry) {
      return res.status(404).json({ success: false, message: "No OTP record found for this phone number" });
    }

    // Check if OTP matches
    if (otpEntry.otp !== otp) {
      await OTP.deleteOne({ phone }); // Remove invalid OTP from DB
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // If OTP is valid, remove it from the database
    await OTP.deleteOne({ phone });

    // Fetch the astrologer from the database
    const astrologer = await Astrologer.findOne({ phone });
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // Generate JWT token with astrologerId in the payload
    const token = jwt.sign(
      { astrologerId: astrologer._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Save token in the Session collection
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    const session = new Session({
      authToken: token,
      phone,
      astrologerId: astrologer._id,
      expiresAt,
    });
    await session.save();

    // Send JWT token as HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; Secure; SameSite=Strict`
    );

    // Send the JWT token + isDetailsFilled flag in the response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      isDetailsFilled: astrologer.isDetailsFilled, // <--- Pass this along
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
