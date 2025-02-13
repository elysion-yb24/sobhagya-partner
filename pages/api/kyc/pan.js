import Kyc from "@/models/kyc";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import formidable from "formidable";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

import { fileTypeFromBuffer } from "file-type";
import pdfPoppler from "pdf-poppler";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import dotenv from "dotenv";

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
  const outputImage = `${pdfPath}.jpg`;
  const opts = {
    format: "jpeg",
    out_dir: "./",
    out_prefix: "pan-converted",
    page: 1,
  };

  console.time("PDF to Image Conversion");
  await pdfPoppler.convert(pdfPath, opts);
  console.timeEnd("PDF to Image Conversion");

  return outputImage;
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
    .png({
      compressionLevel: 6,
      force: true,
    })
    .toBuffer();
  console.timeEnd("Image to Standard PNG Conversion");

  return result;
}

async function handler(req, res) {
  console.log("Inside backend: /api/kyc/pan (No Background Removal)");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing FormData:", err);
      return res.status(500).json({ success: false, message: "Error processing the request." });
    }

    // Validate PAN number
    let { panNumber } = fields;
    if (Array.isArray(panNumber)) panNumber = panNumber[0];

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panNumber || !panRegex.test(panNumber)) {
      return res.status(400).json({ success: false, message: "Invalid PAN number format." });
    }

    // Validate file
    let { panFile } = files;
    if (!panFile) {
      return res.status(400).json({ success: false, message: "PAN file is required." });
    }
    if (Array.isArray(panFile) && panFile.length > 0) {
      panFile = panFile[0];
    }
    const { filepath, originalFilename } = panFile;

    try {
      console.time("File Read");
      let fileBuffer = await fs.readFile(filepath);
      console.timeEnd("File Read");

      console.time("File Type Detection");
      let fileTypeResult = await fileTypeFromBuffer(fileBuffer);
      console.timeEnd("File Type Detection");

      console.log("1) Detected file type:", fileTypeResult);

      // If PDF, convert first page → JPEG
      if (fileTypeResult?.mime === "application/pdf") {
        console.log("Converting PDF to image...");
        const convertedPath = await convertPdfToImage(filepath);

        console.time("Read Converted Image");
        fileBuffer = await fs.readFile(convertedPath);
        console.timeEnd("Read Converted Image");

        console.time("Re-detect File Type");
        fileTypeResult = await fileTypeFromBuffer(fileBuffer);
        console.timeEnd("Re-detect File Type");

        console.log("2) After PDF conversion, file type:", fileTypeResult);
      }

      // Convert image to standard PNG format
      console.log("Converting to standard PNG...");
      fileBuffer = await toStandardPng(fileBuffer);

      console.time("Final File Type Detection");
      const confirmType = await fileTypeFromBuffer(fileBuffer);
      console.timeEnd("Final File Type Detection");

      console.log("3) Final file type (should be PNG):", confirmType);

      // Upload final image to Azure
      console.time("Azure Upload");
      const containerClient = getBlobContainerClient("images");
      await containerClient.createIfNotExists({ access: "blob" });

      const uniqueName = `${uuidv4()}-${originalFilename.replace(/\s+/g, "_")}`;
      const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/png" },
      });
      console.timeEnd("Azure Upload");

      const azureFileUrl = blockBlobClient.url;
      console.log("PAN file uploaded:", azureFileUrl);

      // Update MongoDB
      console.time("MongoDB Update");
      const astrologerId = req.astrologerId;
      if (!astrologerId) {
        return res.status(401).json({ success: false, message: "Unauthorized. Please log in again." });
      }

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

      return res.status(200).json({
        success: true,
        message: "KYC Step 2 (PAN) completed successfully.",
        data: kycEntry,
      });
    } catch (error) {
      console.error("Error uploading PAN or updating DB:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
}

export default async (req, res) => validateJWT(req, res, () => handler(req, res));
