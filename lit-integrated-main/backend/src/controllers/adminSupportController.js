import {
  listAdminSupportRequests,
  getAdminSupportRequest,
  replyToSupportRequest,
  updateSupportRequestStatus,
  assignSupportRequest,
  deleteSupportRequest,
  listSupportAdmins,
  getSupportDashboardStats,
} from "../services/supportService.js";

export async function getAdminSupportRequests(req, res) {
  const requests = await listAdminSupportRequests({
    status: req.query.status,
    priority: req.query.priority,
    search: req.query.search,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
    limit: req.query.limit ? Number(req.query.limit) : 100,
  });
  res.json({ success: true, data: { requests } });
}

export async function getAdminSupportStats(req, res) {
  const stats = await getSupportDashboardStats();
  res.json({ success: true, data: { support: stats } });
}

export async function getAdminSupportAdmins(req, res) {
  const admins = await listSupportAdmins();
  res.json({ success: true, data: { admins } });
}

export async function getAdminSupportRequestById(req, res) {
  const request = await getAdminSupportRequest(req.params.id);
  res.json({ success: true, data: { request } });
}

export async function postAdminSupportReply(req, res) {
  const result = await replyToSupportRequest(req.params.id, req.dbUser.id, req.body);
  res.json({ success: true, data: result });
}

export async function patchAdminSupportStatus(req, res) {
  const result = await updateSupportRequestStatus(req.params.id, req.body.status);
  res.json({ success: true, data: result });
}

export async function patchAdminSupportAssign(req, res) {
  const result = await assignSupportRequest(req.params.id, req.body.assignedToId ?? null);
  res.json({ success: true, data: result });
}

export async function deleteAdminSupportRequest(req, res) {
  const result = await deleteSupportRequest(req.params.id);
  res.json({ success: true, data: result });
}

export default {
  getAdminSupportRequests,
  getAdminSupportStats,
  getAdminSupportAdmins,
  getAdminSupportRequestById,
  postAdminSupportReply,
  patchAdminSupportStatus,
  patchAdminSupportAssign,
  deleteAdminSupportRequest,
};
