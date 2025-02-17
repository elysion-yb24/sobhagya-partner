import connectDb from "@/config/db";
import OTP from "@/models/otp";
import sendOtp from "@/utils/sendOtp";

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return new Response(
        JSON.stringify({ success: false, message: "Phone number is required." }),
        { status: 400 }
      );
    }

    await connectDb();
    console.log("Database connected successfully");

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
      return new Response(
        JSON.stringify({ success: false, message: "Failed to send OTP." }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
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
