import jwt from "jsonwebtoken";
import dbConnect from "@/config/db";
import Team from "@/models/team";

export async function checkAdminAuth(request) {
  console.log("[checkAdminAuth] invoked");
  try {
    // 1) Read token from the Authorization header
    const cookieHeader = request.headers.get("cookie") || ""; 
// Example: "sessionId=abc123; access_token=eyJhbGc...; i18nextLng=en"



// Split by semicolons
const cookiePairs = cookieHeader.split("; "); // ["sessionId=abc123", "access_token=eyJhbGc...", "i18nextLng=en"]

console.log("Splitted cookies:",cookiePairs);
let accessToken = null;
for (const pair of cookiePairs) {
  const [name, value] = pair.split("=");
  if (name === "access_token") {
    accessToken = value;                                                                  
    break;
  }
}
console.log("Extracted token:", accessToken);


    
    // We skip cookies logic entirely, as you requested
    const token = accessToken; 
    console.log("[checkAdminAuth] Using token:", token);

    if (!token) {
      console.log("[checkAdminAuth] No token found in request");
      return {
        authorized: false,
        status: 401,
        message: "No token provided in request headers or cookies.",
      };
    }

    // 2) Verify & decode the JWT
    console.log("[checkAdminAuth] Verifying token with SECRET:", process.env.JWT_SECRET_ADMIN);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    } catch (err) {
      console.log("[checkAdminAuth] Token verification failed:", err.message);
      return {
        authorized: false,
        status: 401,
        message: "Invalid or expired token.",
      };
    }
    console.log("[checkAdminAuth] Decoded token:", decoded);

    // 3) Connect to DB & check Admin
    console.log("[checkAdminAuth] Connecting to DB...");
    await dbConnect();

    console.log("[checkAdminAuth] Fetching admin user with ID: 67c16d4ae1d0eb7db8359a94");
    const adminUser = await Team.findById("67c16d4ae1d0eb7db8359a94");
    console.log("[checkAdminAuth] Admin user found:", adminUser);

    if (!adminUser) {
      console.log("[checkAdminAuth] Admin user not found");
      return {
        authorized: false,
        status: 404,
        message: "Admin not found.",
      };
    }

    // 4) Check role
    if (adminUser.role !== "admin") {
      console.log("[checkAdminAuth] User is not an admin. Role found:", adminUser.role);
      return {
        authorized: false,
        status: 403,
        message: "Forbidden. You are not an admin.",
      };
    }

    // 5) Retrieve required permissions
    const userPermissions = adminUser.permissions || [];
    console.log("[checkAdminAuth] Admin user permissions:", userPermissions);

    // 6) Return success
    return {
      authorized: true,
      admin: adminUser,
      permissions: userPermissions,
    };
  } catch (error) {
    console.error("[checkAdminAuth] Catch block error:", error);
    return {
      authorized: false,
      status: 401,
      message: "Unauthorized or token expired.",
    };
  }
}
