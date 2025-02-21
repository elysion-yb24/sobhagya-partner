import Kyc from "@/models/kyc";
import connectDB from "@/config/db";
import validateJWT from "@/middlewares/jwtValidation";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { getBlobContainerClient } from "@/config/azureStorage";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function toStandardPng(buffer) {
  return await sharp(buffer)
    .withMetadata()
    .toColourspace("srgb")
    .png({ compressionLevel: 6, force: true })
    .toBuffer();
}

async function resizeImage(imageBuffer) {
  return await sharp(imageBuffer).resize(800, 800, { fit: "inside" }).toBuffer();
}

export async function POST(req) {
  try {
    // 1) Extract token
    const token = cookies().get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized." }),
        { status: 401 }
      );
    }

    // 2) Validate JWT
    const astrologerId = await validateJWT(token).catch((err) => {
      console.error("JWT validation error:", err.message);
      return null;
    });
    if (!astrologerId) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid token." }),
        { status: 403 }
      );
    }

    // 3) Connect to DB
    await connectDB();

    // 4) Parse FormData
    const formData = await req.formData();

    // 5) Validate PAN number
    const panNumber = formData.get("panNumber");
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panNumber || !panRegex.test(panNumber)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid PAN number format." }),
        { status: 400 }
      );
    }

    // 6) Check if user re-uploaded panFile
    const panFile = formData.get("panFile"); // might be null if no new file

    // 7) Fetch existing KYC
    const existingKyc = await Kyc.findOne({ astrologerId }).lean();
    let oldPanUrl = existingKyc?.panFile;

    let newPanUrl;
    if (panFile && panFile instanceof Blob) {
      // user DID re-upload
      let fileBuffer = Buffer.from(await panFile.arrayBuffer());
      let fileType = await fileTypeFromBuffer(fileBuffer);

      const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
      if (!fileType || !allowedMimes.includes(fileType.mime)) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid file type. Only JPEG and PNG are allowed.",
          }),
          { status: 400 }
        );
      }

      // convert to PNG if needed
      if (fileType.mime !== "image/png") {
        fileBuffer = await toStandardPng(fileBuffer);
      }
      // resize
      fileBuffer = await resizeImage(fileBuffer);

      // Upload to Azure
      const uniqueName = `${uuidv4()}-pan.png`;
      const containerClient = getBlobContainerClient("images");
      await containerClient.createIfNotExists({ access: "blob" });

      const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: { blobContentType: "image/png" },
      });
      newPanUrl = blockBlobClient.url;
    } else {
      // No new file → use oldPanUrl if it exists
      if (!oldPanUrl) {
        // means user never had a PAN file in DB => must upload
        return new Response(
          JSON.stringify({
            success: false,
            message: "No existing PAN file found. Please upload new file.",
          }),
          { status: 400 }
        );
      }
      newPanUrl = oldPanUrl;
    }

    // 8) Upsert KYC doc
    const updatedKyc = await Kyc.findOneAndUpdate(
      { astrologerId },
      { astrologerId, panNumber, panFile: newPanUrl, page2Filled: true },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "PAN uploaded successfully.",
        data: updatedKyc,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading PAN:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error. Please try again." }),
      { status: 500 }
    );
  }
}
