// app/api/admin/astrologers/[id]/reject/route.js

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";

export async function POST(request, { params }) {
  try {
    // ✅ 1) Connect to DB
    await dbConnect();

    // ✅ 2) Find Astrologer by ID
    const { id } = params;
    const astrologer = await Astrologer.findById(id);

    if (!astrologer) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Astrologer not found." }),
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // ✅ 3) Mark astrologer as 'rejected'
    astrologer.leadStatus = "rejected";
    astrologer.interviewStatus="Rejected"
    await astrologer.save();

    // ✅ 4) Return success response with CORS headers
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Astrologer ${id} has been rejected.`,
      }),
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error rejecting astrologer:", error);
    return new NextResponse(
      JSON.stringify({ success: false, message: "Internal server error." }),
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

// ✅ Handle OPTIONS method for CORS Preflight Requests
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
