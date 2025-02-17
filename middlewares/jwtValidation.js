import jwt from "jsonwebtoken";
import Session from "@/models/session";
import { cookies } from "next/headers";

export default async function validateJWT(token) {
  return new Promise(async (resolve, reject) => {
    try {
      // Extract token from cookies if not provided directly
      if (!token) {
        token = cookies().get("token")?.value;
      }

      if (!token) {
        console.error("JWT validation error: No token provided.");
        return reject(new Error("Unauthorized"));
      }

      // Ensure JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is missing in environment variables.");
        return reject(new Error("Server error"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check session validity
      const session = await Session.findOne({ authToken: token });
      if (!session) {
        return reject(new Error("Session not found. Please log in again."));
      }

      // Check session expiration
      if (Date.now() > new Date(session.expiresAt).getTime()) {
        return reject(new Error("Session expired. Please log in again."));
      }

      // Return astrologer ID
      resolve(decoded.astrologerId);
    } catch (error) {
      console.error("JWT validation error:", error.message);
      return reject(new Error("Invalid token"));
    }
  });
}
