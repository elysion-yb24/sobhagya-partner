// /pages/api/kyc/aadhar.js

import Kyc from "@/models/kyc";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import formidable from "formidable";
import { uploadFileToAzure } from "@/utils/upload";

connectDB();

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  console.log("Inside backend: /api/kyc/aadhar");

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed." });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing FormData:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error processing the request." });
    }

    console.log("Parsed Fields:", fields);
    console.log("Parsed Files:", files);

    let { aadharNumber } = fields;
    if (Array.isArray(aadharNumber)) {
      aadharNumber = aadharNumber[0];
    }

    console.log("Aadhaar Number:", aadharNumber);

    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Aadhaar number." });
    }

    let { aadharFile } = files;
    if (!aadharFile) {
      return res
        .status(400)
        .json({ success: false, message: "Aadhar file is required." });
    }

    if (Array.isArray(aadharFile) && aadharFile.length > 0) {
      aadharFile = aadharFile[0];
    }

    const { filepath, originalFilename, mimetype } = aadharFile;
    if (!filepath || !originalFilename || !mimetype) {
      return res.status(400).json({
        success: false,
        message: "Incomplete file upload. Please try again.",
      });
    }

    try {
      const azureFileUrl = await uploadFileToAzure(
        filepath,
        originalFilename,
        mimetype
      );

      console.log("Uploaded Aadhaar URL:", azureFileUrl);

      const astrologerId = req.astrologerId;
      if (!astrologerId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Please log in again.",
        });
      }

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

      return res.status(200).json({
        success: true,
        message: "KYC Step 1 completed successfully.",
        data: kycEntry,
      });
    } catch (error) {
      console.error("Error uploading Aadhaar or updating DB:", error);
      return res.status(500).json({
        success: false,
        message: "Server error. Please try again later.",
      });
    }
  });
}

export default async (req, res) =>
  validateJWT(req, res, () => handler(req, res));
