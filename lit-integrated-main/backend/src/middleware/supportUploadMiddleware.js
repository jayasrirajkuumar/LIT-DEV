import multer from "multer";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

export const supportAttachmentUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new AppError("Only images and PDF files are allowed.", 400, "VALIDATION_ERROR"));
      return;
    }
    cb(null, true);
  },
});

export default supportAttachmentUpload;
