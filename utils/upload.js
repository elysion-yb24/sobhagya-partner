// /utils/upload.js

import { getBlobContainerClient } from "@/config/azureStorage";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function uploadFileToAzure(filePath, originalFilename, mimeType) {
  try {
    const uniqueName = `${uuidv4()}-${originalFilename.replace(/\s+/g, "_")}`;
    const containerName = "images"; // Change if necessary
    const containerClient = getBlobContainerClient(containerName);

    // Ensure the container exists
    const createContainerResponse = await containerClient.createIfNotExists({
      access: 'blob',
    });
    if (createContainerResponse.succeeded) {
      console.log(`Container "${containerName}" created.`);
    }

    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    const fileData = await fs.readFile(filePath);

    await blockBlobClient.uploadData(fileData, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading file to Azure:", error);
    throw error;
  }
}
