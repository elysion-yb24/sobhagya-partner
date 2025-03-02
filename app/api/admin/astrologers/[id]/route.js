import dbConnect from "@/config/db";
import Astrologer from "@/models/astrologer";
import Kyc from "@/models/kyc";

export async function GET(req, { params }) {
  console.log("Inside Fetching Astrologer Backend");

  const { id } = params; // Extract ID from the dynamic route parameter

  try {
    await dbConnect(); // Ensure DB is connected

    // 1) Fetch astrologer by ID
    const astrologer = await Astrologer.findById(id);
    if (!astrologer) {
      return new Response(JSON.stringify({ success: false, message: "Astrologer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2) Fetch KYC record for this astrologer
    const kycRecord = await Kyc.findOne({ astrologerId: id });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          astrologer,
          kyc: kycRecord,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching single astrologer:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
