import { blobStorageService } from "../services/blobStorageService.js";
import { auditLogService } from "../services/auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

export async function uploadImage(req, res) {
  const result = await blobStorageService.uploadProductImage(req.file);

  await auditLogService.record({
    adminUserId: req.dbUser.id,
    action: AUDIT_ACTIONS.IMAGE_UPLOADED,
    entityType: "image",
    metadata: { url: result.url, size: result.size },
  });

  res.status(201).json({ success: true, data: result });
}

export async function deleteImage(req, res) {
  const { url } = req.validatedBody;
  await blobStorageService.deleteProductImage(url);

  await auditLogService.record({
    adminUserId: req.dbUser.id,
    action: AUDIT_ACTIONS.IMAGE_DELETED,
    entityType: "image",
    metadata: { url },
  });

  res.json({ success: true, data: { deleted: true } });
}

export default { uploadImage, deleteImage };
