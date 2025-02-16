import dbConnect from "@/config/db";
import Astrologer from '@/models/astrologer';
import OTP from "@/models/otp";
import sendOtp from "@/utils/sendOtp";

export async function POST(req) {
  await dbConnect();
  console.log('Database connected successfully');

  try {
    const body = await req.json(); // Get request body
    const { name, phone } = body;

    // Validate inputs
    if (!name || !phone) {
      return new Response(JSON.stringify({ success: false, message: 'Name and phone number are required.' }), { status: 400 });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid phone number format.' }), { status: 400 });
    }

    // Check if phone number already exists
    const existingUser = await Astrologer.findOne({ phone });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: 'Phone number already registered.' }), { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
    console.log("Generated OTP:", otp);

    // Remove any existing OTP for this phone
    await OTP.deleteMany({ phone });

    // Save OTP in the database
    await OTP.create({ phone, otp, expiresAt });
    console.log("OTP stored successfully.");

    // Send OTP
    const sendSuccess = await sendOtp(phone, otp);
    if (!sendSuccess) {
      return new Response(JSON.stringify({ success: false, message: 'Failed to send OTP.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP sent successfully.' }), { status: 200 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(JSON.stringify({ success: false, message: 'Server error.', error: error.message }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ success: false, message: "GET method not allowed." }), { status: 405 });
}
