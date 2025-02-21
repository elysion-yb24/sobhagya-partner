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
 * Convert any image buffer to PNG format
 */
async function toStandardPng(buffer) {
  return await sharp(buffer)
    .withMetadata()
    .toColourspace("srgb")
    .png({ compressionLevel: 6, force: true })
    .toBuffer();
}

/**
 * Resize image to max 800x800 px
 */
async function resizeImage(imageBuffer) {
  return await sharp(imageBuffer)
    .resize(800, 800, { fit: "inside" })
    .toBuffer();
}

export async function POST(req) {
  try {
    console.log("Inside backend: /api/kyc/aadhar");
    console.time("Total Processing Time");

    // 1) Extract token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // 2) Validate JWT
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

    // 3) Connect to DB
    await connectDB();
    console.log("✅ Database connected successfully");

    // 4) Parse FormData
    console.time("Parsing Form Data");
    const formData = await req.formData();
    console.timeEnd("Parsing Form Data");

    // 5) Validate Aadhaar Number
    const aadharNumber = formData.get("aadharNumber");
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid Aadhaar number." }),
        { status: 400 }
      );
    }

    // 6) Extract files (they might be missing if not re-uploaded)
    const aadharFrontFile = formData.get("aadharFrontFile");
    const aadharBackFile = formData.get("aadharBackFile");

    // 7) Fetch any existing KYC entry so we can reuse file URLs if needed
    let existingKyc = await Kyc.findOne({ astrologerId });
    let frontUrl = existingKyc?.aadharFrontFile;
    let backUrl = existingKyc?.aadharBackFile;

    // Process and upload new files if they are provided
    if (aadharFrontFile && aadharFrontFile instanceof Blob) {
      frontUrl = await processAndUploadImage(aadharFrontFile, "aadharFrontFile");
    }
    if (aadharBackFile && aadharBackFile instanceof Blob) {
      backUrl = await processAndUploadImage(aadharBackFile, "aadharBackFile");
    }

    // 8) Update or create the KYC entry
    console.time("MongoDB Update");
    const updatedKyc = await Kyc.findOneAndUpdate(
      { astrologerId },
      {
        astrologerId,
        aadharNumber,
        aadharFrontFile: frontUrl,
        aadharBackFile: backUrl,
        page1Filled: true,
      },
      { upsert: true, new: true }
    );
    console.timeEnd("MongoDB Update");

    console.timeEnd("Total Processing Time");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Aadhaar uploaded successfully.",
        data: updatedKyc,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/kyc/aadhar:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error. Please try again later." }),
      { status: 500 }
    );
  }
}

/**
 * Helper function to process (convert, resize) & upload a single image
 */
async function processAndUploadImage(fileBlob, type) {
  console.time(`Convert ${type} to Buffer`);
  let fileBuffer = Buffer.from(await fileBlob.arrayBuffer());
  console.timeEnd(`Convert ${type} to Buffer`);

  console.time(`Detect ${type} File Type`);
  const fileType = await fileTypeFromBuffer(fileBuffer);
  console.timeEnd(`Detect ${type} File Type`);
  console.log(`Detected ${type} File Type:`, fileType?.mime);

  // Only allow JPEG/PNG
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
  if (!fileType || !allowedMimes.includes(fileType.mime)) {
    throw new Error(`Invalid file type for ${type}. Only JPEG and PNG are allowed.`);
  }

  // Convert to PNG if needed
  if (fileType.mime !== "image/png") {
    console.log(`Converting ${type} to PNG format...`);
    fileBuffer = await toStandardPng(fileBuffer);
  }

  // Resize image
  console.log(`Resizing ${type} to 800x800 max...`);
  fileBuffer = await resizeImage(fileBuffer);

  // Upload to Azure
  console.time(`Azure Upload for ${type}`);
  const uniqueName = `${uuidv4()}-${type}.png`;
  const containerClient = getBlobContainerClient("images");
  await containerClient.createIfNotExists({ access: "blob" });

  const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
  await blockBlobClient.uploadData(fileBuffer, {
    blobHTTPHeaders: { blobContentType: "image/png" },
  });

  const azureFileUrl = blockBlobClient.url;
  console.log(`${type} image uploaded to:`, azureFileUrl);
  console.timeEnd(`Azure Upload for ${type}`);

  return azureFileUrl;
}
