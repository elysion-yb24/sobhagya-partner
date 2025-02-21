import { NextResponse } from "next/server";
import Kyc from "@/models/kyc"; // Import your Mongoose KYC model
import dbConnect from "@/config/db"; // Import your MongoDB connection helper
import jwt from "jsonwebtoken"; // Import JWT for verification
import { cookies } from "next/headers"; // Import Next.js cookies helper

export async function GET(req) {
  try {
    // 1️⃣ Connect to the database
    await dbConnect();

    // 2️⃣ Get the token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    // 3️⃣ Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    // 4️⃣ Extract astrologerId from the decoded token
    const astrologerId = decoded.astrologerId;
    if (!astrologerId) {
      return NextResponse.json({ message: "Unauthorized: Invalid token payload" }, { status: 401 });
    }

    // 5️⃣ Fetch the Aadhaar (KYC) record associated with this astrologer
    console.log("Fetching KYC details for:", astrologerId);
    const kycRecord = await Kyc.findOne({ astrologerId }).lean();

    if (!kycRecord) {
      return NextResponse.json({ message: "Aadhaar details not found" }, { status: 404 });
    }

    // 6️⃣ Return the Aadhaar details
    return NextResponse.json({
      success: true,
      aadhaarNumber: kycRecord.aadharNumber || null,
      aadhaarFrontUrl: kycRecord.aadharFrontFile || null,
      aadhaarBackUrl: kycRecord.aadharBackFile || null,
      page1Filled: kycRecord.page1Filled || false, // Indicates if page 1 is completed
    });

  } catch (error) {
    console.error("Error in fetch-aadhar-details:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
