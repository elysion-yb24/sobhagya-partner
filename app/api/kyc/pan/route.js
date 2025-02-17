import connectDB from "@/config/db";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import pdfPoppler from "pdf-poppler";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import Kyc from "@/models/kyc";
import validateJWT from "@/middlewares/jwtValidation";
import { cookies } from "next/headers";

/**
 * Convert PDF to JPEG (First Page Only)
 */
async function convertPdfToImage(pdfPath) {
  const opts = {
    format: "jpeg",
    out_dir: "./",
    out_prefix: "pan-converted",
    page: 1,
  };
  console.time("PDF to Image Conversion");
  await pdfPoppler.convert(pdfPath, opts);
  console.timeEnd("PDF to Image Conversion");
  return `${pdfPath}-1.jpg`; // Returning first page
}

/**
 * Convert any image to standard sRGB PNG
 */
async function toStandardPng(buffer) {
  console.time("Image to Standard PNG Conversion");
  const result = await sharp(buffer)
    .withMetadata()
    .flatten({ background: "#ffffff" }) // Ensure white background
    .toColourspace("srgb")
    .png({ compressionLevel: 6, force: true })
    .toBuffer();
  console.timeEnd("Image to Standard PNG Conversion");
  return result;
}

export async function POST(req) {
  try {
    console.time("Total Processing Time");

    // ✅ Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // ✅ Validate JWT and extract astrologerId
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

    // ✅ Connect to the database
    await connectDB();

    // ✅ Parse `multipart/form-data` using Next.js built-in `formData()`
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
      return new Response(
        JSON.stringify({ success: false, message: "PAN file is required." }),
        { status: 400 }
      );
    }

    // ✅ Convert File (Blob) to Buffer
    console.time("Convert File to Buffer");
    let fileBuffer = Buffer.from(await panFile.arrayBuffer()); // `let` allows reassignments later
    console.timeEnd("Convert File to Buffer");

    // ✅ Detect File Type
    console.time("Detect File Type");
    let fileType = await fileTypeFromBuffer(fileBuffer); // `let` allows updates later
    console.timeEnd("Detect File Type");
    console.log("Detected File Type:", fileType?.mime);

    // ✅ Convert PDF to Image if needed
    if (fileType?.mime === "application/pdf") {
      console.time("PDF Conversion");
      console.log("Converting PDF to Image...");
      const tempPdfPath = `/tmp/${uuidv4()}.pdf`;
      await fs.writeFile(tempPdfPath, fileBuffer);

      // Convert first page of PDF to JPEG
      const imagePath = await convertPdfToImage(tempPdfPath);
      fileBuffer = await fs.readFile(imagePath);
      fileType = await fileTypeFromBuffer(fileBuffer);
      console.timeEnd("PDF Conversion");
    }

    // ✅ Preprocess Image
    console.time("Image Preprocessing");
    console.log("Preprocessing image...");
    fileBuffer = await toStandardPng(fileBuffer);
    console.timeEnd("Image Preprocessing");

    // ✅ Upload to Azure Storage
    console.time("Azure Upload");
    const uniqueName = `${uuidv4()}-pan.png`;
    const containerClient = getBlobContainerClient("images");
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: "image/png" },
    });

    const azureFileUrl = blockBlobClient.url;
    console.log("PAN Image uploaded to:", azureFileUrl);
    console.timeEnd("Azure Upload");

    // ✅ Update MongoDB KYC Entry
    console.time("MongoDB Update");
    const kycEntry = await Kyc.findOneAndUpdate(
      { astrologerId },
      {
        astrologerId,
        panNumber,
        panFile: azureFileUrl,
        page2Filled: true,
      },
      { upsert: true, new: true }
    );
    console.timeEnd("MongoDB Update");

    console.timeEnd("Total Processing Time");

    return new Response(
      JSON.stringify({
        success: true,
        message: "KYC Step 2 (PAN) completed successfully.",
        data: kycEntry,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading PAN or updating DB:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error. Please try again later.",
      }),
      { status: 500 }
    );
  }
}
