import { auditLogService } from "../services/auditLogService.js";

export async function getAuditLogs(req, res) {
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;
  const result = await auditLogService.list({ limit, offset });
  res.json({ success: true, data: result });
}

export default { getAuditLogs };
