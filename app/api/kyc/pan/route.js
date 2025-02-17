import Kyc from "@/models/kyc";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import { cookies } from "next/headers";

// ✅ Remove Next.js default body parser
export const dynamic = "force-dynamic";

/**
 * Convert any image to PNG format
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
 * Resize image to a max dimension of 800x800 px
 */
async function resizeImage(imageBuffer) {
  console.time("Image Resize");
  const resized = await sharp(imageBuffer).resize(800, 800, { fit: "inside" }).toBuffer();
  console.timeEnd("Image Resize");
  return resized;
}

export async function POST(req) {
  try {
    console.log("Inside backend: /api/kyc/pan");
    console.time("Total Processing Time");

    // ✅ Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized." }), { status: 401 });
    }

    // ✅ Validate JWT & extract astrologerId
    const astrologerId = await validateJWT(token).catch((err) => {
      console.error("JWT validation error:", err.message);
      return null;
    });
    if (!astrologerId) {
      return new Response(JSON.stringify({ success: false, message: "Invalid token." }), { status: 403 });
    }

    // ✅ Connect to database
    await connectDB();
    console.log("✅ Database connected successfully");

    // ✅ Parse FormData
    console.time("Parsing Form Data");
    const formData = await req.formData();
    console.timeEnd("Parsing Form Data");

    // ✅ Validate PAN Number
    const panNumber = formData.get("panNumber");
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panNumber || !panRegex.test(panNumber)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid PAN number format." }),
        { status: 400 }
      );
    }

    // ✅ Validate PAN File
    const panFile = formData.get("panFile");
    if (!panFile || !(panFile instanceof Blob)) {
      return new Response(JSON.stringify({ success: false, message: "PAN file is required." }), { status: 400 });
    }

    // ✅ Convert Blob to Buffer
    console.time("Convert File to Buffer");
    let fileBuffer = Buffer.from(await panFile.arrayBuffer());
    console.timeEnd("Convert File to Buffer");

    // ✅ Detect File Type
    console.time("Detect File Type");
    let fileType = await fileTypeFromBuffer(fileBuffer);
    console.timeEnd("Detect File Type");
    console.log("Detected File Type:", fileType?.mime);

    // ✅ Only accept JPEG/PNG
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid file type. Only JPEG and PNG are allowed." }),
        { status: 400 }
      );
    }

    // ✅ Convert to PNG if needed
    if (fileType.mime !== "image/png") {
      console.log("Converting to PNG format...");
      fileBuffer = await toStandardPng(fileBuffer);
    }

    // ✅ Resize image to 800x800 px
    console.log("Resizing image...");
    fileBuffer = await resizeImage(fileBuffer);

    // ✅ Upload to Azure
    console.time("Azure Upload");
    const uniqueName = `${uuidv4()}-pan.png`;
    const containerClient = getBlobContainerClient("images");
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    await blockBlobClient.uploadData(fileBuffer, { blobHTTPHeaders: { blobContentType: "image/png" } });
    const azureFileUrl = blockBlobClient.url;
    console.log("PAN Image uploaded to:", azureFileUrl);
    console.timeEnd("Azure Upload");

    // ✅ Update MongoDB (KYC)
    console.time("MongoDB Update");
    const kycEntry = await Kyc.findOneAndUpdate(
      { astrologerId },
      { astrologerId, panNumber, panFile: azureFileUrl, page2Filled: true },
      { upsert: true, new: true }
    );
    console.timeEnd("MongoDB Update");

    console.timeEnd("Total Processing Time");

    return new Response(JSON.stringify({ success: true, message: "PAN uploaded successfully.", data: kycEntry }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error uploading PAN or updating DB:", error);
    return new Response(JSON.stringify({ success: false, message: "Server error. Please try again later." }), {
      status: 500,
    });
  }
}
