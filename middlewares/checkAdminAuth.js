import jwt from "jsonwebtoken";
import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";

export default function checkAdminAuth(handler) {
  return async (req, res) => {
    try {
      // 1) Connect to DB
      console.log("Test2")
      await dbConnect();

      // 2) Get the token from the Authorization header or cookies
      // Example: "Authorization: Bearer <token>"
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      // If token is also stored in cookies, you could do:
      // const { token: cookieToken } = req.cookies;
      // const token = token || cookieToken;

      if (!token) {
        return res.status(401).json({ success: false, message: "No token provided. Admin only." });
      }

      // 3) Verify token
      // Ensure you use the same secret as in your sign method
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4) Check the user in your database and confirm they're an admin
      // This example uses an "Astrologer" model, but typically you might have a separate "Admin" model.
      // Or you might have a role field in the user schema. We'll pretend "role" is in the token or DB.
      const astrologer = await Astrologer.findById(decoded.astrologerId);

      if (!astrologer) {
        return res.status(401).json({ success: false, message: "Invalid token or user not found." });
      }

      // Example: if the token had a "role" field
      if (!decoded.role || decoded.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden. Admins only." });
      }

      // Alternatively, if your DB has an "isAdmin" field on the user:
      // if (!astrologer.isAdmin) {
      //   return res.status(403).json({ success: false, message: "Forbidden. Admins only." });
      // }

      // 5) Attach user info to req if needed
      req.user = astrologer;
      req.astrologerId = astrologer._id; // if you still need it

      // 6) Proceed to the next function (the actual handler)
      return handler(req, res);

    } catch (error) {
      console.error("Admin auth error:", error);
      return res.status(401).json({ success: false, message: "Unauthorized or token expired." });
    }
  };
}
