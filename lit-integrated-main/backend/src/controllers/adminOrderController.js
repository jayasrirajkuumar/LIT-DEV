import {
  listAdminOrders,
  getAdminOrder,
  updateAdminOrderStatus,
  updateAdminOrderTracking,
  updateAdminOrderNotes,
  exportAdminOrders,
  getAdminOrderStats,
} from "../services/adminOrderService.js";

export async function getAdminOrdersHandler(req, res) {
  const result = await listAdminOrders(req.validatedQuery ?? {});
  res.json({ success: true, data: result });
}

export async function getAdminOrderHandler(req, res) {
  const order = await getAdminOrder(req.validatedParams.id);
  res.json({ success: true, data: { order } });
}

export async function patchAdminOrderStatusHandler(req, res) {
  const order = await updateAdminOrderStatus(
    req.validatedParams.id,
    req.dbUser.id,
    req.validatedBody,
  );
  res.json({ success: true, data: { order } });
}

export async function patchAdminOrderTrackingHandler(req, res) {
  const order = await updateAdminOrderTracking(
    req.validatedParams.id,
    req.dbUser.id,
    req.validatedBody,
  );
  res.json({ success: true, data: { order } });
}

export async function patchAdminOrderNotesHandler(req, res) {
  const order = await updateAdminOrderNotes(req.validatedParams.id, req.validatedBody);
  res.json({ success: true, data: { order } });
}

export async function getAdminOrdersExportHandler(req, res) {
  const csv = await exportAdminOrders(req.validatedQuery ?? {});
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=lit-orders.csv");
  res.send(csv);
}

export async function getAdminOrderStatsHandler(req, res) {
  const stats = await getAdminOrderStats();
  res.json({ success: true, data: { stats } });
}

export default {
  getAdminOrdersHandler,
  getAdminOrderHandler,
  patchAdminOrderStatusHandler,
  patchAdminOrderTrackingHandler,
  patchAdminOrderNotesHandler,
  getAdminOrdersExportHandler,
  getAdminOrderStatsHandler,
};
