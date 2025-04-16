// app/api/admin/astrologers/[id]/update/route.js

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";

export async function POST(request, { params }) {
  try {
    // 1) Connect to the database
    await dbConnect();

    // 2) Parse request body
    const { audioPrice, videoPrice,displayAudioPrice,displayVideoPrice } = await request.json();

    // 3) Find Astrologer by ID
    const { id } = params;
    const astrologer = await Astrologer.findById(id);

    if (!astrologer) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Astrologer not found." }),
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // 4) Update astrologer's audio & video call prices
    astrologer.interviewStatus="Clear"
    astrologer.audioPrice = audioPrice;
    astrologer.videoPrice = videoPrice;
    astrologer.displayAudioPrice = displayAudioPrice
    astrologer.displayVideoPrice = displayVideoPrice
    
    await astrologer.save();

    // 5) Return success response with CORS headers
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: `Astrologer ${id} prices updated successfully.`,
        data: {
          audioPrice: astrologer.audioPrice,
          videoPrice: astrologer.videoPrice,
        },
      }),
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("Error updating astrologer prices:", error);
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
