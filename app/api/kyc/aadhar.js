import connectDB from "@/config/db";
import formidable from "formidable";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import pdfPoppler from "pdf-poppler";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import dotenv from "dotenv";
import Kyc from "@/models/kyc";
import validateJWT from "@/middlewares/jwtValidation";

dotenv.config();
connectDB();

export const config = {
  api: {
    bodyParser: false,
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

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  console.time("Total Processing Time");

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ success: false, message: "Error processing request." });
    }

    // ✅ Extract astrologerId from request (JWT Middleware must set this)
    const astrologerId = req.astrologerId;
    if (!astrologerId) {
      return res.status(401).json({ success: false, message: "Unauthorized. Missing astrologerId." });
    }

    let { aadharNumber } = fields;
    if (Array.isArray(aadharNumber)) aadharNumber = aadharNumber[0];
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({ success: false, message: "Invalid Aadhaar number." });
    }

    let { aadharFile } = files;
    if (!aadharFile) {
      return res.status(400).json({ success: false, message: "Aadhaar file is required." });
    }
    if (Array.isArray(aadharFile)) aadharFile = aadharFile[0];

    try {
      console.time("Read File");
      let fileBuffer = await fs.readFile(aadharFile.filepath);
      console.timeEnd("Read File");

      console.time("Detect File Type");
      let fileType = await fileTypeFromBuffer(fileBuffer);
      console.timeEnd("Detect File Type");
      console.log("Detected File Type:", fileType?.mime);

      if (fileType?.mime === "application/pdf") {
        console.time("PDF Conversion");
        console.log("Converting PDF to Image...");
        const imagePath = await convertPdfToImage(aadharFile.filepath);
        fileBuffer = await fs.readFile(imagePath);
        fileType = await fileTypeFromBuffer(fileBuffer);
        console.timeEnd("PDF Conversion");
      }

      console.time("Image Preprocessing");
      console.log("Preprocessing image...");
      fileBuffer = await preprocessImage(fileBuffer);
      console.timeEnd("Image Preprocessing");

      console.time("Azure Upload");
      const uniqueName = `${uuidv4()}-${aadharFile.originalFilename.replace(/\s+/g, "_")}`;
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

      console.time("MongoDB Update");
      const kycEntry = await Kyc.findOneAndUpdate(
        { astrologerId }, // ✅ Search by astrologerId
        { 
          astrologerId, // ✅ Ensure astrologerId is stored
          aadharNumber, 
          aadharFile: azureFileUrl, 
          page1Filled: true 
        },
        { upsert: true, new: true }
      );
      console.timeEnd("MongoDB Update");

      console.timeEnd("Total Processing Time");

      return res.status(200).json({
        success: true,
        message: "KYC Step 1 completed successfully.",
        data: kycEntry,
      });
    } catch (error) {
      console.error("Error processing Aadhaar file:", error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  });
}

// ✅ Wrap the handler with `validateJWT` to ensure astrologerId is available
export default (req, res) => validateJWT(req, res, () => handler(req, res));
