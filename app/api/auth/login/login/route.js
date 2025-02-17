import connectDB from "@/config/db";
import Astrologer from "@/models/astrologer";
import OTP from "@/models/otp";
import sendOtp from "@/utils/sendOtp";

export async function POST(req) {
  await connectDB();
  console.log("Database connected successfully");

  try {
    const body = await req.json();
    const { phone } = body;

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid phone number." }),
        { status: 400 }
      );
    }

    // Check if the user exists in the database
    const user = await Astrologer.findOne({ phone });

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found. Please register as an astrologer.",
        }),
        { status: 404 }
      );
    }

    // Generate a random OTP (4-digit)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes

    // Save OTP in the database
    await OTP.create({
      phone,
      otp,
      expiresAt: otpExpiry,
    });

    console.log("Generated OTP:", otp); // Debugging (remove in production)

    // Send OTP to the user's phone
    const sendSuccess = await sendOtp(phone, otp);
    if (!sendSuccess) {
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send OTP." }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP generated and sent successfully. Please verify.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign-In Error:", error.message);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ success: false, message: "GET method not allowed." }),
    { status: 405 }
  );
}
