// app/api/admin/astrologers/[id]/update/route.js

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Kyc from "@/models/kyc";

export async function POST(request, { params }) {
  try {
    // 1) Connect to the database
    await dbConnect();

    // 2) Parse request body for the KYC notification message
    const { kycNotification } = await request.json();

    // 3) Find KYC by Astrologer ID
    const { id } = params;
    const astrologerKYC = await Kyc.findOne({ astrologerId: id });

    if (!astrologerKYC) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Astrologer KYC not found." }),
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 4) Update KYC Notification
    astrologerKYC.kycNotification = kycNotification;
    await astrologerKYC.save();

    // 5) Return success response with CORS headers
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `KYC notification updated successfully for Astrologer ${id}.`,
        data: {
          kycNotification: astrologerKYC.kycNotification,
        },
      }),
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error updating KYC details:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

// Handle OPTIONS method for CORS Preflight Requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
