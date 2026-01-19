import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
} from "./env";

// AWS S3 Configuration - matching mobile app exactly
const s3Config = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_KEY,
  },
};

const s3Client = new S3Client(s3Config);
const BUCKET_NAME = AWS_BUCKET_NAME;

export const uploadFile = async (file: File): Promise<string> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Convert file to ArrayBuffer (browser-compatible)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to S3 - AWS SDK v3 accepts Uint8Array directly in browsers
    // Note: S3 bucket needs CORS configuration to allow browser uploads
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: uint8Array,
      ContentType: file.type,
      // Add CORS headers for browser uploads
      Metadata: {
        "original-name": file.name,
      },
    });

    const response = await s3Client.send(command);

    // Mobile app gets: res.body.postResponse.location from RNS3.put()
    // AWS SDK v3 PutObjectCommand doesn't return location in response
    // But we construct the same format URL that mobile app gets
    // Mobile app uses useAccelerateEndpoint: true, but standard URL format matches
    // Format should be: https://bucket-name.s3.region.amazonaws.com/key
    // This matches what mobile app's postResponse.location returns
    const fileUrl = `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${fileName}`;

    console.log("S3 upload successful, file URL:", fileUrl);
    console.log("Response:", response);

    return fileUrl;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Upload file from Blob/Data URL
 * @param blob - Blob object
 * @param fileName - Optional filename
 * @param mimeType - MIME type of the file
 * @returns Promise<string> - The S3 URL of the uploaded file
 */
export const uploadBlob = async (
  blob: Blob,
  fileName?: string,
  mimeType?: string
): Promise<string> => {
  try {
    // Generate unique filename if not provided
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName?.split(".").pop() || "jpg";
    const finalFileName =
      fileName || `${timestamp}_${randomString}.${fileExtension}`;

    // Convert blob to Uint8Array (browser-compatible)
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to S3 - AWS SDK v3 accepts Uint8Array directly in browsers
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: finalFileName,
      Body: uint8Array,
      ContentType: mimeType || blob.type || "image/jpeg",
      ACL: "public-read",
    });

    await s3Client
      .send(command)
      .then((res) => {
        console.log("Upload successful", res);
      })
      .catch((err) => {
        console.error("Upload failed", err);
        throw err;
      });

    // Return the public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.${s3Config.region}.amazonaws.com/${finalFileName}`;
    console.log(fileUrl);

    return fileUrl;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};
