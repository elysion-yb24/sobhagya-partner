// /pages/api/kyc/bankDetails.js

import formidable from "formidable";
import Kyc from "@/models/kyc";
import Astrologer from "@/models/astrologer";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import { uploadFileToAzure } from "@/utils/upload"; // Import the Azure upload utility
import fs from "fs"; // File system module for file operations

connectDB(); // Ensure the database is connected

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parsing
  },
};

// Helper function to parse the form
const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false }); // Expecting single file upload
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

async function handler(req, res) {
  console.log("Inside backend: /api/kyc/bankDetails");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    const { fields, files } = await parseForm(req);

    // Extract and sanitize fields
    const bankAccountNumber = Array.isArray(fields.bankAccountNumber)
      ? fields.bankAccountNumber[0]
      : fields.bankAccountNumber;
    const accountHolderName = Array.isArray(fields.accountHolderName)
      ? fields.accountHolderName[0]
      : fields.accountHolderName;
    const ifscCode = Array.isArray(fields.ifscCode) ? fields.ifscCode[0] : fields.ifscCode;
    const branchName = Array.isArray(fields.branchName) ? fields.branchName[0] : fields.branchName;
    const upiId = Array.isArray(fields.upiId) ? fields.upiId[0] : fields.upiId;

    console.log("Parsed Fields:", { bankAccountNumber, accountHolderName, ifscCode, branchName, upiId });

    // Validate required fields
    if (!bankAccountNumber || !accountHolderName || !ifscCode || !branchName || !upiId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate IFSC code format (optional)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IFSC code format.",
      });
    }

    let { cancelledCheque } = files;
    if (!cancelledCheque) {
      return res.status(400).json({ success: false, message: "Cancelled cheque image is required." });
    }

    // Ensure single file upload
    if (Array.isArray(cancelledCheque) && cancelledCheque.length > 0) {
      cancelledCheque = cancelledCheque[0];
    }

    const { filepath, originalFilename, mimetype } = cancelledCheque;
    if (!filepath || !originalFilename || !mimetype) {
      return res.status(400).json({
        success: false,
        message: "Incomplete file upload. Please try again.",
      });
    }

    // Validate file type and size
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
      // Upload the cancelled cheque image to Azure
      const azureFileUrl = await uploadFileToAzure(filepath, originalFilename, mimetype);
      console.log("Uploaded Cancelled Cheque URL:", azureFileUrl);

      const astrologerId = req.astrologerId;
      if (!astrologerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in again.",
        });
      }

      // Create or update KYC entry with bank details
      const kycEntry = await Kyc.findOneAndUpdate(
        { astrologerId },
        {
          astrologerId,
          "bankDetails.bankAccountNumber": bankAccountNumber,
          "bankDetails.accountHolderName": accountHolderName,
          "bankDetails.ifscCode": ifscCode,
          "bankDetails.branchName": branchName,
          "bankDetails.upiId": upiId,
          "bankDetails.cancelledCheque": azureFileUrl, // Store the actual Azure URL
          page4Filled: true,
        },
        { upsert: true, new: true }
      );

      console.log("KYC Entry after Bank Details upload:", kycEntry);

      // Update Astrologer status
      await Astrologer.findByIdAndUpdate(
        req.astrologerId,
        { isKycDone: true }
      );

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
        message: "Bank details submitted successfully.",
        data: kycEntry,
      });
    } catch (uploadError) {
      console.error("Error uploading cancelled cheque or updating DB:", uploadError);
      return res.status(500).json({
        success: false,
        message: "Server error while uploading the cheque. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error processing form:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
}

// Use validateJWT middleware
export default async (req, res) => validateJWT(req, res, () => handler(req, res));
