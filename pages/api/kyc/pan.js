// /pages/api/kyc/pan.js

import Kyc from "@/models/kyc"; // Import the KYC model
import connectDB from "@/config/db"; // Database connection function
import validateJWT from "@/middlewares/jwtValidation"; // JWT validation middleware
import formidable from "formidable";
import { uploadFileToAzure } from "@/utils/upload"; // Import the Azure upload utility

connectDB(); // Ensure the database is connected

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for handling FormData
  },
};

async function handler(req, res) {
  console.log("Inside backend: /api/kyc/pan");

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

    let { panNumber } = fields;

    // Ensure panNumber is a string
    if (Array.isArray(panNumber)) {
      panNumber = panNumber[0]; // Extract the first value
    }

    console.log("PAN Number:", panNumber); // Debug PAN number

    // Validate PAN number format (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panNumber || !panRegex.test(panNumber)) {
      return res.status(400).json({ success: false, message: "Invalid PAN number format." });
    }

    let { panFile } = files;
    if (!panFile) {
      return res.status(400).json({ success: false, message: "PAN file is required." });
    }

    if (Array.isArray(panFile) && panFile.length > 0) {
      panFile = panFile[0];
    }

    const { filepath, originalFilename, mimetype } = panFile;
    if (!filepath || !originalFilename || !mimetype) {
      return res.status(400).json({
        success: false,
        message: "Incomplete file upload. Please try again.",
      });
    }

    try {
      // Upload the PAN file to Azure
      const azureFileUrl = await uploadFileToAzure(filepath, originalFilename, mimetype);

      console.log("Uploaded PAN URL:", azureFileUrl);

      const astrologerId = req.astrologerId;
      if (!astrologerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in again.",
        });
      }

      // Create or update KYC entry with PAN details
      const kycEntry = await Kyc.findOneAndUpdate(
        { astrologerId },
        {
          astrologerId,
          panNumber,
          panFile: azureFileUrl, // Store the Azure URL
          page2Filled: true,
        },
        { upsert: true, new: true } // Create new entry if it doesn't exist
      );

      return res.status(200).json({
        success: true,
        message: "KYC Step 2 completed successfully.",
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

// Use the validateJWT middleware
export default async (req, res) => validateJWT(req, res, () => handler(req, res));
