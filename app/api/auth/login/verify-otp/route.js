import connectDb from "@/config/db";
import OTP from "@/models/otp";
import Session from "@/models/session";
import Astrologer from "@/models/astrologer";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ success: false, message: "Phone and OTP are required." }),
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDb();
    console.log("Database connected successfully");

    // Fetch the OTP entry
    const otpEntry = await OTP.findOne({ phone });
    if (!otpEntry) {
      return new Response(
        JSON.stringify({ success: false, message: "No OTP record found for this phone number." }),
        { status: 404 }
      );
    }

    // Check if OTP matches
    if (otpEntry.otp !== otp) {
      await OTP.deleteOne({ phone }); // Remove invalid OTP from DB
      return new Response(
        JSON.stringify({ success: false, message: "Invalid OTP." }),
        { status: 401 }
      );
    }

    // If OTP is valid, remove it from the database
    await OTP.deleteOne({ phone });

    // Fetch the astrologer from the database
    const astrologer = await Astrologer.findOne({ phone });
    if (!astrologer) {
      return new Response(
        JSON.stringify({ success: false, message: "Astrologer not found." }),
        { status: 404 }
      );
    }

    // Generate JWT token with astrologerId in the payload
    const token = jwt.sign(
      { astrologerId: astrologer._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Save token in the Session collection
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    await Session.create({
      authToken: token,
      phone,
      astrologerId: astrologer._id,
      expiresAt,
    });

    // Set JWT token as HttpOnly cookie
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; Secure; SameSite=Strict`
    );

    // Send the JWT token + isDetailsFilled flag in the response
    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP verified successfully.",
        token,
        isDetailsFilled: astrologer.isDetailsFilled,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
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
