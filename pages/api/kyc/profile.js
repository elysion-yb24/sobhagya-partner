import Kyc from "@/models/kyc"; // MongoDB Model
import connectDB from "@/config/db"; // Database Connection
import validateJWT from "@/middlewares/jwtValidation"; // JWT Validation Middleware
import formidable from "formidable";
import { uploadFileToAzure } from "@/utils/upload"; // Azure Upload Utility
import fs from "fs-extra"; // File System Module
import { fileTypeFromBuffer } from "file-type"; // File Type Detection
import { rembg } from "@remove-background-ai/rembg.js"; // Background Removal Library
import sharp from "sharp"; // Image Processing Library
import dotenv from "dotenv";

dotenv.config();
connectDB();

export const config = {
  api: {
    bodyParser: false, // Disable Next.js built-in body parser to handle FormData manually
  },
};

/**
 * Convert image to PNG format (for `rembg.js` compatibility)
 */
async function convertToPng(buffer) {
  return await sharp(buffer).toFormat("png").toBuffer();
}

/**
 * Resize image to a max dimension of 500x500 pixels (to optimize processing)
 */
async function resizeImage(imageBuffer) {
  return await sharp(imageBuffer).resize(500, 500, { fit: "inside" }).toBuffer();
}

/**
 * Remove background from an image using rembg.js
 */
async function removeBackground(imageBuffer) {
  try {
    console.log("Resizing image for processing...");
    const resizedImage = await resizeImage(imageBuffer);

    console.log("Converting image to PNG format...");
    const pngBuffer = await convertToPng(resizedImage);

    console.log("Using Remove.bg API Key:", process.env.REMOVEBG_API_KEY);
    console.log("Removing background using rembg.js...");

    const { outputImagePath, cleanup } = await rembg({
      apiKey: process.env.REMOVEBG_API_KEY,
      inputImage: pngBuffer,
    });

    console.log("Background removal completed.");
    const cleanedBuffer = await fs.readFile(outputImagePath);
    await cleanup(); // Delete temporary files

    return cleanedBuffer;
  } catch (error) {
    console.error("❌ Background removal failed. Using original image:", error);
    return imageBuffer; // Fallback to original image if background removal fails
  }
}

async function handler(req, res) {
  console.log("Inside backend: /api/kyc/displayPic with background removal");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing FormData:", err);
      return res.status(500).json({ success: false, message: "Error processing request." });
    }

    let { displayName } = fields;

    if (Array.isArray(displayName)) {
      displayName = displayName[0]; // Ensure displayName is a string
    }

    console.log("Display Name:", displayName);

    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ success: false, message: "Display name is required." });
    }

    let { displayPic } = files;
    if (!displayPic) {
      return res.status(400).json({ success: false, message: "Display picture is required." });
    }

    if (Array.isArray(displayPic) && displayPic.length > 0) {
      displayPic = displayPic[0];
    }

    const { filepath, originalFilename, mimetype } = displayPic;

    if (!filepath || !originalFilename || !mimetype) {
      return res.status(400).json({
        success: false,
        message: "Incomplete file upload. Please try again.",
      });
    }

    // Validate file type (Only accept PNG & JPEG)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG and PNG are allowed.",
      });
    }

    // Limit file size to 5MB
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const fileStats = fs.statSync(filepath);
    if (fileStats.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit.",
      });
    }

    try {
      console.time("Read File");
      let fileBuffer = await fs.readFile(filepath);
      console.timeEnd("Read File");

      console.time("Detect File Type");
      let fileTypeResult = await fileTypeFromBuffer(fileBuffer);
      console.timeEnd("Detect File Type");
      console.log("Detected File Type:", fileTypeResult?.mime);

      console.time("Background Removal");
      let cleanedImageBuffer = await removeBackground(fileBuffer);
      console.timeEnd("Background Removal");

      // Upload cleaned image to Azure
      console.time("Azure Upload");
      const azureFileUrl = await uploadFileToAzure(filepath, originalFilename, mimetype);
      console.timeEnd("Azure Upload");
      console.log("Uploaded Display Picture URL:", azureFileUrl);

      const astrologerId = req.astrologerId;
      if (!astrologerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in again.",
        });
      }

      // Store the uploaded image URL in MongoDB
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

      console.log("KYC Entry after Display Picture upload:", kycEntry);

      // Delete temporary file after upload
      fs.unlink(filepath, (err) => {
        if (err) {
          console.error("Error deleting temp file:", err);
        } else {
          console.log("Temp file deleted:", filepath);
        }
      });

      return res.status(200).json({
        success: true,
        message: "KYC Step 3 completed successfully with background removal.",
        data: kycEntry,
      });
    } catch (error) {
      console.error("Error uploading display picture or updating DB:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
}

// Use the validateJWT middleware
export default async (req, res) => validateJWT(req, res, () => handler(req, res));
