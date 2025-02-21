import Kyc from "@/models/kyc";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Convert any image to PNG format
 */
async function toStandardPng(buffer) {
  return await sharp(buffer)
    .withMetadata()
    .flatten({ background: "#ffffff" }) // White background if transparency exists
    .toColourspace("srgb")
    .png({ compressionLevel: 6, force: true })
    .toBuffer();
}

/**
 * Resize image to max 500x500 px
 */
async function resizeImage(imageBuffer) {
  return await sharp(imageBuffer)
    .resize(500, 500, { fit: "inside" })
    .toBuffer();
}

export async function POST(req) {
  try {
    // 1️⃣ Extract token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // 2️⃣ Validate JWT
    const astrologerId = await validateJWT(token).catch((err) => {
      console.error("JWT validation error:", err);
      return null;
    });
    if (!astrologerId) {
      return new Response(JSON.stringify({ success: false, message: "Invalid token." }), {
        status: 403,
      });
    }

    // 3️⃣ Connect to database
    await connectDB();

    // 4️⃣ Parse FormData
    const formData = await req.formData();
    const displayName = formData.get("displayName")?.toString() || "";
    if (!displayName.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: "Display name is required." }),
        { status: 400 }
      );
    }

    // 5️⃣ Check if user uploaded a new profilePic
    const profilePic = formData.get("profilePic"); // might be null

    // 6️⃣ Fetch existing KYC
    const existingKyc = await Kyc.findOne({ astrologerId }).lean();
    let oldPicUrl = existingKyc?.displayPic;

    let newPicUrl;
    if (profilePic && profilePic instanceof Blob) {
      // User uploaded a new picture
      let fileBuffer = Buffer.from(await profilePic.arrayBuffer());
      let fileType = await fileTypeFromBuffer(fileBuffer);

      const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
      if (!fileType || !allowedMimes.includes(fileType.mime)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid file type. Only JPEG and PNG are allowed.",
          }),
          { status: 400 }
        );
      }

      // Convert to PNG if needed
      if (fileType.mime !== "image/png") {
        fileBuffer = await toStandardPng(fileBuffer);
      }

      // Resize image
      fileBuffer = await resizeImage(fileBuffer);

      // Upload to Azure
      const uniqueName = `${uuidv4()}-profile.png`;
      const containerClient = getBlobContainerClient("images");
      await containerClient.createIfNotExists({ access: "blob" });

      const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/png" },
      });

      newPicUrl = blockBlobClient.url;
    } else {
      // No new file → Keep oldPicUrl if it exists
      if (!oldPicUrl) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "No existing profile image found. Please upload new.",
          }),
          { status: 400 }
        );
      }
      newPicUrl = oldPicUrl;
    }

    // 7️⃣ Update or insert KYC record
    const updatedKyc = await Kyc.findOneAndUpdate(
      { astrologerId },
      {
        astrologerId,
        displayName,
        displayPic: newPicUrl,
        page3Filled: true,
      },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile uploaded successfully.",
        data: updatedKyc,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading profile:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error. Please try again later." }),
      { status: 500 }
    );
  }
}
