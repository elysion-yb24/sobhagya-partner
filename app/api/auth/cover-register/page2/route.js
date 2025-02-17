import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import OTP from "@/models/otp";
import Session from "@/models/session";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await dbConnect();
  console.log("Database connected successfully");

  try {
    const body = await req.json();
    const { name, phone, otp } = body;

    // Validate inputs
    if (!otp || !phone || !name) {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid or expired OTP." }),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await Astrologer.findOne({ phone });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Phone number already registered.",
        }),
        { status: 400 }
      );
    }

    // Create a new astrologer
    const newAstrologer = new Astrologer({
      name,
      phone,
      isVerified: true,
    });
    await newAstrologer.save();

    // Delete OTP after successful registration
    await OTP.deleteMany({ phone });

    // Generate JWT token
    const token = jwt.sign(
      { astrologerId: newAstrologer._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Save session in database
    await Session.create({
      astrologerId: newAstrologer._id,
      authToken: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1-day expiry
    });

    // Send JWT token as HttpOnly cookie
    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=86400; Secure; SameSite=Strict`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "User registered successfully. JWT token generated.",
        astrologer: newAstrologer,
      }),
      { status: 201, headers }
    );
  } catch (error) {
    console.error("Error in OTP verification or user registration:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error.",
        error: error.message,
      }),
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
