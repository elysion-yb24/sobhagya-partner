import jwt from "jsonwebtoken";
import dbConnect from "@/config/db";
import Admin from "@/models/admin"; // Ensure you use the correct Admin model
import { cookies } from "next/headers"; // For handling cookies in Next.js App Router

export default function checkAdminAuth(handler) {
  return async (req, res) => {
    try {
      console.log("Inside Admin Auth middleware");
      await dbConnect();

      // 1) Get the token from cookies or Authorization header
      const cookieToken = cookies().get("token")?.value || null;
      const authHeader = req.headers.authorization || "";
      const headerToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      const token = cookieToken || headerToken;

      if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized. No token provided." });
      }

      // 2) Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3) Find the admin user in the database
      const admin = await Admin.findById(decoded.adminId);

      if (!admin) {
        return res.status(401).json({ success: false, message: "Invalid token or admin not found." });
      }

      // 4) Ensure user is verified and active
      if (!admin.isVerified) {
        return res.status(403).json({ success: false, message: "Access denied. Admin not verified." });
      }

      if (admin.status === "disabled") {
        return res.status(403).json({ success: false, message: "Admin account is disabled." });
      }

      // 5) Attach admin info to the request
      req.user = admin;
      req.adminId = admin._id;

      // 6) Proceed to the handler
      return handler(req, res);

    } catch (error) {
      console.error("Admin auth error:", error);
      return res.status(401).json({ success: false, message: "Unauthorized or token expired." });
    }
  };
}
