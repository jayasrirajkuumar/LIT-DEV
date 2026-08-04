import multer from "multer";
import { AppError } from "../utils/AppError.js";

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new AppError("Only image uploads are allowed.", 400, "VALIDATION_ERROR"));
      return;
    }
    cb(null, true);
  },
});

export default imageUpload;
