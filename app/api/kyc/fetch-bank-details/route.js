import { NextResponse } from "next/server";
import Kyc from "@/models/kyc";
import dbConnect from "@/config/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    // 1️⃣ Connect to the database
    await dbConnect();

    // 2️⃣ Extract token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Verify JWT token and extract astrologer ID
    let astrologerId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      astrologerId = decoded.astrologerId;
    } catch (error) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 403 });
    }

    // 4️⃣ Fetch bank details from the database
    const kycRecord = await Kyc.findOne({ astrologerId }).lean();
    if (!kycRecord || !kycRecord.bankDetails) {
      return NextResponse.json({ success: false, message: "Bank details not found" }, { status: 404 });
    }

    // 5️⃣ Return bank details
    return NextResponse.json({
      success: true,
      bankAccountNumber: kycRecord.bankDetails.bankAccountNumber || null,
      accountHolderName: kycRecord.bankDetails.accountHolderName || null,
      ifscCode: kycRecord.bankDetails.ifscCode || null,
      branchName: kycRecord.bankDetails.branchName || null,
      upiId: kycRecord.bankDetails.upiId || null,
      cancelledCheque: kycRecord.bankDetails.cancelledCheque || null, // Image URL
    });

  } catch (error) {
    console.error("Error in fetch-bank-details:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
