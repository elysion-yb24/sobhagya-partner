// /pages/api/kyc/displayPic.js

import Kyc from "@/models/kyc"; // Import the KYC model
import connectDB from "@/config/db"; // Database connection function
import validateJWT from "@/middlewares/jwtValidation"; // JWT validation middleware
import formidable from "formidable";
import { uploadFileToAzure } from "@/utils/upload"; // Import the Azure upload utility
import fs from "fs"; // File system module for file operations

connectDB(); // Ensure the database is connected

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for handling FormData
  },
};

async function handler(req, res) {
  console.log("Inside backend: /api/kyc/displayPic");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const form = formidable({ multiples: false }); // Disable multiple files if only one file is expected

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing FormData:", err);
      return res.status(500).json({ success: false, message: "Error processing the request." });
    }

    console.log("Parsed Fields:", fields);
    console.log("Parsed Files:", files);

    let { displayName } = fields;

    // Ensure displayName is a string
    if (Array.isArray(displayName)) {
      displayName = displayName[0]; // Extract the first value
    }

    console.log("Display Name:", displayName); // Debug display name

    // Validate displayName (optional, based on your requirements)
    if (!displayName || displayName.trim() === "") {
      return res.status(400).json({ success: false, message: "Display name is required." });
    }

    let { displayPic } = files;
    if (!displayPic) {
      return res.status(400).json({ success: false, message: "Display picture is required." });
    }

    // If multiple files were somehow uploaded, take the first one
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

    // Optional: Validate file type and size
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG and PNG are allowed.",
      });
    }

    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    const fileStats = fs.statSync(filepath);
    if (fileStats.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit.",
      });
    }

    try {
      // Upload the display picture to Azure
      const azureFileUrl = await uploadFileToAzure(filepath, originalFilename, mimetype);
      console.log("Uploaded Display Picture URL:", azureFileUrl);

      const astrologerId = req.astrologerId;
      if (!astrologerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in again.",
        });
      }

      // Create or update KYC entry with display picture details
      const kycEntry = await Kyc.findOneAndUpdate(
        { astrologerId },
        {
          astrologerId,
          displayName,
          displayPic: azureFileUrl, // Store the actual Azure URL
          page3Filled: true,
        },
        { upsert: true, new: true } // Create new entry if it doesn't exist
      );

      console.log("KYC Entry after Display Picture upload:", kycEntry);

      // Optional: Delete the temporary file after upload
      fs.unlink(filepath, (err) => {
        if (err) {
          console.error("Error deleting temp file:", err);
        } else {
          console.log("Temp file deleted:", filepath);
        }
      });

      return res.status(200).json({
        success: true,
        message: "KYC Step 3 completed successfully.",
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
