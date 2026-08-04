import { storeSettingsService } from "../services/storeSettingsService.js";
import { auditLogService } from "../services/auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

export async function getSettings(_req, res) {
  const settings = await storeSettingsService.get();
  res.json({ success: true, data: { settings } });
}

export async function patchSettings(req, res) {
  const settings = await storeSettingsService.update(req.validatedBody, req.dbUser.id);

  await auditLogService.record({
    adminUserId: req.dbUser.id,
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    entityType: "settings",
    metadata: { sections: Object.keys(req.validatedBody) },
  });

  res.json({ success: true, data: { settings } });
}

export default { getSettings, patchSettings };
