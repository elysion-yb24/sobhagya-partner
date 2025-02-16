import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Clear the JWT cookie by setting it with an expired date
      res.setHeader(
        "Set-Cookie",
        serialize("token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/", // Ensure the cookie is removed site-wide
          expires: new Date(0), // Expire immediately
        })
      );

      return res.status(200).json({
        success: true,
        message: "You have been signed out successfully!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "An error occurred while signing out.",
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }
}
