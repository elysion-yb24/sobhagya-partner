import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";

export async function POST(req) {
  await dbConnect();
  console.log("Database connected successfully");

  try {
    const body = await req.json();
    const { phone, yoe, languages, astrologerTypes } = body;

    // Validate inputs
    if (!phone || !yoe || !languages?.length || !astrologerTypes?.length) {
      return new Response(
        JSON.stringify({ success: false, message: "All fields are required." }),
        { status: 400 }
      );
    }

    // Check if the astrologer exists
    const astrologer = await Astrologer.findOne({ phone });
    if (!astrologer) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found. Complete earlier steps first.",
        }),
        { status: 404 }
      );
    }

    // Update astrologer details
    astrologer.yearsOfExperience = yoe;
    astrologer.languages = languages; // multiple languages
    astrologer.specializations = astrologerTypes; // multiple specializations
    astrologer.isDetailsFilled = true;
    await astrologer.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Details updated successfully.",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in filling details:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error.",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ success: false, message: "GET method not allowed." }),
    { status: 405 }
  );
}
