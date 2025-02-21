import { NextResponse } from "next/server";
import Kyc from "@/models/kyc";
import dbConnect from "@/config/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    await dbConnect();

    const token = cookies().get("token")?.value;
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const astrologerId = decoded.astrologerId;

    const kycRecord = await Kyc.findOne({ astrologerId }).lean();
    if (!kycRecord) return NextResponse.json({ message: "Profile details not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      displayName: kycRecord.displayName || null,
      profilePicUrl: kycRecord.displayPic || null,
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
