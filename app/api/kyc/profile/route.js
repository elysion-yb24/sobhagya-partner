import Kyc from "@/models/kyc";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import { cookies } from "next/headers";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js automatic body parsing
  },
};

/**
 * Convert any image to standard sRGB PNG
 */
async function toStandardPng(buffer) {
  console.time("Image to Standard PNG Conversion");
  const result = await sharp(buffer)
    .withMetadata()
    .flatten({ background: "#ffffff" }) // White background if any transparency
    .toColourspace("srgb")
    .png({ compressionLevel: 6, force: true })
    .toBuffer();
  console.timeEnd("Image to Standard PNG Conversion");
  return result;
}

/**
 * Resize image to a max dimension of 500x500 px for optimization
 */
async function resizeImage(imageBuffer) {
  console.time("Image Resize");
  const resized = await sharp(imageBuffer).resize(500, 500, { fit: "inside" }).toBuffer();
  console.timeEnd("Image Resize");
  return resized;
}

export async function POST(req) {
  try {
    console.log("Inside backend: /api/kyc/profile");
    console.time("Total Processing Time");

    // 1️⃣ Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // 2️⃣ Validate JWT & extract astrologerId
    const astrologerId = await validateJWT(token).catch((err) => {
      console.error("JWT validation error:", err.message);
      return null;
    });
    if (!astrologerId) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token." }),
        { status: 403 }
      );
    }

    // 3️⃣ Connect to database
    await connectDB();
    console.log("✅ Database connected successfully");

    // 4️⃣ Parse FormData
    console.time("Parsing Form Data");
    const formData = await req.formData();
    console.timeEnd("Parsing Form Data");

    // 5️⃣ Validate displayName
    const displayName = formData.get("displayName");
    if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
      return new Response(
        JSON.stringify({ success: false, message: "Display name is required." }),
        { status: 400 }
      );
    }

    // 6️⃣ Validate profilePic
    const profilePic = formData.get("profilePic");
    if (!profilePic || !(profilePic instanceof Blob)) {
      return new Response(
        JSON.stringify({ success: false, message: "Profile picture is required." }),
        { status: 400 }
      );
    }

    // 7️⃣ Convert Blob to Buffer
    console.time("Convert File to Buffer");
    let fileBuffer = Buffer.from(await profilePic.arrayBuffer());
    console.timeEnd("Convert File to Buffer");

    // 8️⃣ Detect File Type
    console.time("Detect File Type");
    let fileType = await fileTypeFromBuffer(fileBuffer);
    console.timeEnd("Detect File Type");
    console.log("Detected File Type:", fileType?.mime);

    // 9️⃣ Only accept JPEG/PNG
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid file type. Only JPEG and PNG are allowed.",
        }),
        { status: 400 }
      );
    }

    // 🔟 Convert to PNG if needed
    if (fileType.mime !== "image/png") {
      console.log("Converting to PNG format...");
      fileBuffer = await toStandardPng(fileBuffer);
    }

    // 1️⃣1️⃣ Resize image to 500x500 px
    console.log("Resizing image...");
    fileBuffer = await resizeImage(fileBuffer);

    // 1️⃣2️⃣ Upload to Azure
    console.time("Azure Upload");
    const uniqueName = `${uuidv4()}-profile.png`;
    const containerClient = getBlobContainerClient("images");
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: "image/png" },
    });
    const azureFileUrl = blockBlobClient.url;
    console.log("Profile Image uploaded to:", azureFileUrl);
    console.timeEnd("Azure Upload");

    // 1️⃣3️⃣ Update MongoDB (KYC)
    console.time("MongoDB Update");
    const kycEntry = await Kyc.findOneAndUpdate(
      { astrologerId },
      {
        astrologerId,
        displayName,
        displayPic: azureFileUrl,
        page3Filled: true,
      },
      { upsert: true, new: true }
    );
    console.timeEnd("MongoDB Update");

    console.timeEnd("Total Processing Time");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile uploaded successfully.",
        data: kycEntry,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading profile or updating DB:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error. Please try again later." }),
      { status: 500 }
    );
  }
}
