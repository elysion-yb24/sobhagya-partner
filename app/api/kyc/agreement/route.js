import db from "@/config/db"; // Database Connection
import Astrologer from "@/models/astrologer"; // Astrologer Model
import validateJWT from "@/middlewares/jwtValidation"; // JWT Validation Middleware
import { cookies } from "next/headers";

export async function GET() {
  try {
    // 1️⃣ Connect to MongoDB
    await db();

    // 2️⃣ Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // 3️⃣ Validate JWT and extract astrologer ID
    const astrologerId = await validateJWT(token).catch((error) => {
      console.error("JWT validation error:", error.message);
      return null;
    });
    if (!astrologerId) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token." }),
        { status: 403 }
      );
    }

    // 4️⃣ Fetch astrologer details from DB
    const astrologer = await Astrologer.findById(astrologerId).select("name");
    if (!astrologer) {
      return new Response(
        JSON.stringify({ success: false, message: "Astrologer not found." }),
        { status: 404 }
      );
    }

    // 5️⃣ Get today’s date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // 6️⃣ Return astrologer details + today’s date
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          name: astrologer.name,
          date: today,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching astrologer details:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}
