import connectDb from "@/config/db";
import OTP from "@/models/otp";
// Import your sendOtp function
import sendOtp from "@/utils/sendOtp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  try {
    await connectDb();

    // Delete any existing OTP for the given phone number
    await OTP.deleteMany({ phone });

    // Generate a new 4-digit random OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Save the new OTP in the database
    await OTP.create({
      phone,
      otp,
      expiresAt: otpExpiry,
    });

    console.log(`New OTP generated for ${phone}: ${otp}`);

    // Send the OTP using your Fast2SMS (or any other) service
    const sendSuccess = await sendOtp(phone, otp);
    if (!sendSuccess) {
      return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
