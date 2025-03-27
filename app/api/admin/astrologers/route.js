import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import { checkAdminAuth } from "@/middlewares/checkAdminAuth";

// Allowed origins list
const allowedOrigins = [
  "http://localhost:3000",  // Local development frontend
  "https://admin.sobhagya.in/"
  
];

// Function to get proper CORS headers dynamically
function getCorsHeaders(request) {
  const origin = request.headers.get("origin");
  let corsOrigin = "";

  if (!origin || allowedOrigins.includes(origin)) {
    corsOrigin = origin || "*";  // Allow requests from known origins or Postman (no origin)
  }

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// OPTIONS handler (for preflight requests)
export async function OPTIONS(request) {
  console.log("[Route] OPTIONS preflight request received from:", request.headers.get("origin"));
  const headers = getCorsHeaders(request);
  return NextResponse.json({}, { status: 200, headers });
}

// GET handler
export async function GET(request) {
  const headers = getCorsHeaders(request);

  console.log("[Backend] Received Request Headers:", request.headers);
  console.log("[Route] GET /api/admin/astrologers invoked");
  console.log("[Route] Request origin:", request.headers.get("origin"));
  console.log("[Route] Checking admin authentication...");

  // 1) Check admin authentication
  const authResult = await checkAdminAuth(request);
  console.log("[Route] Authentication result:", authResult);

  const { authorized, status, message, permissions } = authResult;
  if (!authorized) {
    console.log("[Route] Authorization failed:", message);
    return NextResponse.json(
      { success: false, message },
      { status, headers }
    );
  }

  // 2) Check if the admin has the required permission
  if (!permissions || !permissions.readUser) {
    console.log("[Route] Permission check failed: Missing 'readUser' permission");
    return NextResponse.json(
      { success: false, message: "No permission to read user data." },
      { status: 403, headers }
    );
  }

  try {
    console.log("[Route] Connecting to DB...");
    await dbConnect();
    console.log("[Route] Fetching astrologers from the DB...");

    const astrologers = await Astrologer.find({});
    console.log("[Route] Fetched astrologers:", astrologers);

    return NextResponse.json(
      { success: true, data: astrologers },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("[Route] Error fetching astrologers:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500, headers }
    );
  }
}
