import connectDB from "@/config/db";
import Astrologer from "@/models/astrologer";
import OTP from "@/models/otp";
// Import your sendOtp function
import sendOtp from "@/utils/sendOtp";

export default async function handler(req, res) {
  await connectDB(); // Ensure database connection

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { phone } = req.body;

  // Validate phone number
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, message: "Invalid phone number" });
  }

  try {
    // Check if the user exists in the database
    const user = await Astrologer.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register as an astrologer.",
      });
    }

    // Generate a random OTP (4-digit or 6-digit, your choice)
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // Save OTP in the database
    await OTP.create({
      phone,
      otp,
      expiresAt: otpExpiry,
    });

    // Log OTP for debugging (remove in production)
    console.log("Generated OTP:", otp);

    // Send OTP to the user's phone
    const sendSuccess = await sendOtp(phone, otp);
    if (!sendSuccess) {
      return res.status(500).json({
        success: false, 
        message: "Failed to send OTP.",
      });
    }

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "OTP generated and sent successfully. Please verify.",
    });
  } catch (error) {
    console.error("Sign-In Error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
