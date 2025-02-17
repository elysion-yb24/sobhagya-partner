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

export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing for file upload
  },
};

/**
 * Convert PDF to JPEG (First Page Only)
 */
async function convertPdfToImage(pdfPath) {
  const opts = {
    format: "jpeg",
    out_dir: "./",
    out_prefix: "converted",
    page: 1,
  };
  await pdfPoppler.convert(pdfPath, opts);
  return "./converted-1.jpg";
}

/**
 * Resize & Convert Image to PNG
 */
async function preprocessImage(imageBuffer) {
  return await sharp(imageBuffer).resize(800).toFormat("png").toBuffer();
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

    // ✅ Validate Aadhaar Number
    const aadharNumber = formData.get("aadharNumber");
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid Aadhaar number." }),
        { status: 400 }
      );
    }

    // ✅ Validate Aadhaar File
    const aadharFile = formData.get("aadharFile");
    if (!aadharFile || !(aadharFile instanceof Blob)) {
      return new Response(
        JSON.stringify({ success: false, message: "Aadhaar file is required." }),
        { status: 400 }
      );
    }

    // ✅ Convert File (Blob) to Buffer
    console.time("Convert File to Buffer");
    let fileBuffer = Buffer.from(await aadharFile.arrayBuffer()); // use `let`
    console.timeEnd("Convert File to Buffer");

    // ✅ Detect File Type
    console.time("Detect File Type");
    let fileType = await fileTypeFromBuffer(fileBuffer); // use `let`
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
      fileBuffer = await fs.readFile(imagePath); // reassign is allowed with `let`
      fileType = await fileTypeFromBuffer(fileBuffer); // reassign with `let`
      console.timeEnd("PDF Conversion");
    }

    // ✅ Preprocess Image
    console.time("Image Preprocessing");
    console.log("Preprocessing image...");
    fileBuffer = await preprocessImage(fileBuffer); // reassign with `let`
    console.timeEnd("Image Preprocessing");

    // ✅ Upload to Azure Storage
    console.time("Azure Upload");
    const uniqueName = `${uuidv4()}-aadhaar.png`; // or any naming scheme
    const containerName = "images";
    const containerClient = getBlobContainerClient(containerName);
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: "image/png" },
    });

    const azureFileUrl = blockBlobClient.url;
    console.log("Aadhaar Image uploaded to:", azureFileUrl);
    console.timeEnd("Azure Upload");

    // ✅ Update MongoDB KYC Entry
    console.time("MongoDB Update");
    const kycEntry = await Kyc.findOneAndUpdate(
      { astrologerId },
      {
        astrologerId,
        aadharNumber,
        aadharFile: azureFileUrl,
        page1Filled: true,
      },
      { upsert: true, new: true }
    );
    console.timeEnd("MongoDB Update");

    console.timeEnd("Total Processing Time");

    return new Response(
      JSON.stringify({
        success: true,
        message: "KYC Step 1 completed successfully.",
        data: kycEntry,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Aadhaar file:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error." }),
      { status: 500 }
    );
  }
}
