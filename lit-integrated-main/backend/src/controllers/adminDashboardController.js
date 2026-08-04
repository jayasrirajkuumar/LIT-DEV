import {
  getDashboardStats,
  listAdminInventory,
  updateInventory,
  listAdminProducts,
  getAdminProductById,
  listAdminCategories,
  listAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomer,
} from "../services/adminDashboardService.js";
import { auditLogService } from "../services/auditLogService.js";
import { adminNotificationService } from "../services/adminNotificationService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

export async function getDashboard(req, res) {
  await adminNotificationService.syncOperationalAlerts();
  await auditLogService.logAdminAccess(req.dbUser.id);
  const stats = await getDashboardStats();
  res.json({ success: true, data: stats });
}

export async function getInventory(req, res) {
  const result = await listAdminInventory(req.validatedQuery ?? {});
  if (result?.pagination) {
    res.json({ success: true, data: result });
    return;
  }
  res.json({ success: true, data: { inventory: result } });
}

export async function patchInventory(req, res) {
  const result = await updateInventory(req.validatedParams.id, req.validatedBody);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." },
    });
  }

  await auditLogService.record({
    adminUserId: req.dbUser.id,
    action: AUDIT_ACTIONS.INVENTORY_UPDATED,
    entityType: "product",
    entityId: req.validatedParams.id,
    metadata: req.validatedBody,
  });

  res.json({ success: true, data: { inventory: result } });
}

export async function getAdminProducts(req, res) {
  const result = await listAdminProducts(req.validatedQuery ?? {});
  res.json({ success: true, data: result });
}

export async function getAdminProduct(req, res) {
  const product = await getAdminProductById(req.validatedParams.id);
  res.json({ success: true, data: { product } });
}

export async function getAdminCategories(req, res) {
  const result = await listAdminCategories(req.validatedQuery ?? {});
  if (result?.pagination) {
    res.json({ success: true, data: result });
    return;
  }
  res.json({ success: true, data: { categories: result } });
}

export async function getAdminCustomers(req, res) {
  const result = await listAdminCustomers(req.validatedQuery ?? {});
  if (result?.pagination) {
    res.json({ success: true, data: result });
    return;
  }
  res.json({ success: true, data: { customers: result } });
}

export async function getAdminCustomer(req, res) {
  const customer = await getAdminCustomerById(req.validatedParams.id);
  res.json({ success: true, data: customer });
}

export async function patchAdminCustomer(req, res) {
  const user = await updateAdminCustomer(req.validatedParams.id, req.validatedBody);

  await auditLogService.record({
    adminUserId: req.dbUser.id,
    action: req.validatedBody.isActive
      ? AUDIT_ACTIONS.CUSTOMER_ENABLED
      : AUDIT_ACTIONS.CUSTOMER_DISABLED,
    entityType: "user",
    entityId: req.validatedParams.id,
  });

  res.json({ success: true, data: { user } });
}

export default {
  getDashboard,
  getInventory,
  patchInventory,
  getAdminProducts,
  getAdminProduct,
  getAdminCategories,
  getAdminCustomers,
  getAdminCustomer,
  patchAdminCustomer,
};
