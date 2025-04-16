import Kyc from "@/models/kyc"; // MongoDB Model
import Astrologer from "@/models/astrologer"; // Astrologer Model
import connectDB from "@/config/db"; // Database Connection
import validateJWT from "@/middlewares/jwtValidation"; // JWT Validation Middleware
import fs from "fs-extra"; // For temp file checks if needed
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import { getBlobContainerClient } from "@/config/azureStorage";
import { cookies } from "next/headers";

/**
 * Max file size for cancelled cheque (5 MB).
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  try {
    console.log("Inside backend: /api/kyc/bankDetails");

    // 1️⃣ Extract JWT token from cookies
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // 2️⃣ Validate JWT & extract `astrologerId`
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

    // 3️⃣ Connect to the database
    await connectDB();

    // 4️⃣ Parse Form Data using `req.formData()`
    console.time("Parsing Form Data");
    const formData = await req.formData();
    console.timeEnd("Parsing Form Data");

    // 5️⃣ Extract and validate bank fields
    const bankAccountNumber = formData.get("bankAccountNumber");
    const accountHolderName = formData.get("accountHolderName");
    const ifscCode = formData.get("ifscCode");
    const branchName = formData.get("branchName");
    const upiId = formData.get("upiId");

    console.log("Parsed Fields:", {
      bankAccountNumber,
      accountHolderName,
      ifscCode,
      branchName,
      upiId,
    });

    if (
      !bankAccountNumber ||
      !accountHolderName ||
      !ifscCode ||
      !branchName ||
      !upiId
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "All fields are required.",
        }),
        { status: 400 }
      );
    }

    // 6️⃣ Validate IFSC format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid IFSC code format.",
        }),
        { status: 400 }
      );
    }

    // 7️⃣ Validate cancelledCheque file
    let cancelledCheque = formData.get("cancelledCheque");
    if (!cancelledCheque || !(cancelledCheque instanceof Blob)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Cancelled cheque image is required.",
        }),
        { status: 400 }
      );
    }

    // 8️⃣ Convert `Blob` → `Buffer`
    console.time("Convert File to Buffer");
    let fileBuffer = Buffer.from(await cancelledCheque.arrayBuffer());
    console.timeEnd("Convert File to Buffer");

    // 9️⃣ Check file size
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "File size exceeds the 5MB limit.",
        }),
        { status: 400 }
      );
    }

    // 🔟 Determine file MIME type (If needed, do extra checks via `fileTypeFromBuffer`)
    const mimeType = cancelledCheque.type || "image/jpeg";

    // 1️⃣1️⃣ Upload to Azure (using buffer)
    console.time("Azure Upload");
    const uniqueName = `${uuidv4()}-cancelledCheque.png`; // or .jpg as needed
    const containerClient = getBlobContainerClient("images");
    await containerClient.createIfNotExists({ access: "blob" });

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    const azureFileUrl = blockBlobClient.url;
    console.log("Uploaded Cancelled Cheque URL:", azureFileUrl);
    console.timeEnd("Azure Upload");

    // 1️⃣2️⃣ Update MongoDB KYC Entry
    console.time("MongoDB Update");
    const kycEntry = await Kyc.findOneAndUpdate(
      { astrologerId },
      {
        astrologerId,
        "bankDetails.bankAccountNumber": bankAccountNumber,
        "bankDetails.accountHolderName": accountHolderName,
        "bankDetails.ifscCode": ifscCode,
        "bankDetails.branchName": branchName,
        "bankDetails.upiId": upiId,
        "bankDetails.cancelledCheque": azureFileUrl,
        page4Filled: true,
      },
      { upsert: true, new: true }
    );
    console.timeEnd("MongoDB Update");

    console.log("KYC Entry after Bank Details upload:", kycEntry);

    // 1️⃣3️⃣ Update Astrologer Status
    console.time("Astrologer Update");
    await Astrologer.findByIdAndUpdate(astrologerId, { isKycDone: true ,leadStatus:'kyc_done'});
    console.timeEnd("Astrologer Update");

    console.log("✅ Bank details submitted successfully.");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Bank details submitted successfully.",
        data: kycEntry,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing bank details form:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error. Please try again later." }),
      { status: 500 }
    );
  }
}
