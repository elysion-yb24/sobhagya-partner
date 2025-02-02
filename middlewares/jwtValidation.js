import jwt from "jsonwebtoken";
import Session from "@/models/session";

export default async function validateJWT(req, res, next) {
  try {
    // Extract token from HttpOnly cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // Ensure JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in the environment variables.");
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check session validity
    const session = await Session.findOne({ authToken: token });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session not found. Please log in again.",
      });
    }

    // Check session expiration
    if (Date.now() > new Date(session.expiresAt).getTime()) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // Attach astrologer ID to request object
    req.astrologerId = decoded.astrologerId;

    // Continue to the next middleware
    next();
  } catch (error) {
    console.error("JWT validation error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
}
