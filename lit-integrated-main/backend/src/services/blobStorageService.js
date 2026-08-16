import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { BlobServiceClient } from "@azure/storage-blob";
import config from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

function getExtension(mimetype, originalname) {
  const fromMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  }[mimetype];
  if (fromMime) return fromMime;
  const ext = path.extname(originalname || "").toLowerCase();
  return ext || ".jpg";
}

function getLocalUploadDir() {
  return path.join(process.cwd(), "uploads", "products");
}

function getLocalPublicUrl(filename) {
  // Relative URLs load through the Vite /uploads proxy in local dev.
  if (!config.storage.connectionString && config.nodeEnv !== "production") {
    return `/uploads/products/${filename}`;
  }

  const base = config.publicApiUrl.replace(/\/$/, "");
  return `${base}/uploads/products/${filename}`;
}

function extractLocalFilename(imageUrl) {
  if (!imageUrl) return null;
  const match = String(imageUrl).match(/\/uploads\/products\/([^/?#]+)$/);
  return match?.[1] ?? null;
}

async function uploadToAzure(buffer, blobName, contentType) {
  const client = BlobServiceClient.fromConnectionString(config.storage.connectionString);
  const container = client.getContainerClient(config.storage.containerName);
  await container.createIfNotExists({ access: "blob" });
  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlob.url;
}

async function deleteFromAzure(blobUrl) {
  if (!config.storage.connectionString) return;
  try {
    const client = BlobServiceClient.fromConnectionString(config.storage.connectionString);
    const container = client.getContainerClient(config.storage.containerName);
    const prefix = `${container.url}/`;
    if (!blobUrl.startsWith(prefix)) return;
    const blobName = blobUrl.slice(prefix.length);
    await container.deleteBlob(blobName);
  } catch {
    // Best-effort delete
  }
}

async function uploadToLocal(buffer, filename, contentType) {
  const dir = getLocalUploadDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return getLocalPublicUrl(filename);
}

async function deleteFromLocal(blobUrl) {
  const filename = extractLocalFilename(blobUrl);
  if (!filename) return;
  try {
    await fs.unlink(path.join(getLocalUploadDir(), filename));
  } catch {
    // ignore missing file
  }
}

export async function uploadProductImage(file) {
  if (!file?.buffer) {
    throw new AppError("No file uploaded.", 400, "VALIDATION_ERROR");
  }
  if (!ALLOWED_MIME.has(file.mimetype)) {
    throw new AppError("Invalid image type. Use JPEG, PNG, WebP, or GIF.", 400, "VALIDATION_ERROR");
  }
  if (file.size > MAX_BYTES) {
    throw new AppError("Image must be 5 MB or smaller.", 400, "VALIDATION_ERROR");
  }

  const ext = getExtension(file.mimetype, file.originalname);
  const blobName = `products/${randomUUID()}${ext}`;

  let url;
  if (config.storage.connectionString) {
    url = await uploadToAzure(file.buffer, blobName, file.mimetype);
  } else {
    const filename = `${randomUUID()}${ext}`;
    url = await uploadToLocal(file.buffer, filename, file.mimetype);
  }

  return { url, blobName, contentType: file.mimetype, size: file.size };
}

export async function deleteProductImage(imageUrl) {
  if (!imageUrl) return { deleted: false };
  if (config.storage.connectionString) {
    await deleteFromAzure(imageUrl);
  } else {
    await deleteFromLocal(imageUrl);
  }
  return { deleted: true };
}

export const blobStorageService = {
  uploadProductImage,
  deleteProductImage,
};

export default blobStorageService;
