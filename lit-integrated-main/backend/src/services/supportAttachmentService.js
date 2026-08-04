import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import config from "../config/env.js";
import { blobStorageService } from "./blobStorageService.js";

function getExtension(mimetype, originalname) {
  const fromMime = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "application/pdf": ".pdf",
  }[mimetype];
  if (fromMime) return fromMime;
  return path.extname(originalname || "").toLowerCase() || ".bin";
}

function getAttachmentType(mimetype) {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype?.startsWith("image/")) return "image";
  return "file";
}

async function uploadToLocal(buffer, filename) {
  const dir = path.join(process.cwd(), "uploads", "support");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  const base = config.publicApiUrl.replace(/\/$/, "");
  return `${base}/uploads/support/${filename}`;
}

export async function uploadSupportAttachment(file) {
  if (!file?.buffer) {
    throw new Error("No file provided.");
  }

  const ext = getExtension(file.mimetype, file.originalname);
  const filename = `${randomUUID()}${ext}`;
  const attachmentType = getAttachmentType(file.mimetype);

  let url;
  if (config.storage.connectionString) {
    url = await blobStorageService.uploadProductImage({
      ...file,
      originalname: `support/${filename}`,
    }).then((r) => r.url);
  } else {
    url = await uploadToLocal(file.buffer, filename);
  }

  return { url, attachmentType, size: file.size, mimetype: file.mimetype };
}

export default { uploadSupportAttachment };
