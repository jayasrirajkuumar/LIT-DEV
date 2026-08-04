import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { toPublicProduct } from "../utils/catalogMappers.js";
import { auditLogService } from "./auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

function rowsToCsv(rows, columns) {
  const escape = (value) => {
    const str = value == null ? "" : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escape(c.value(row))).join(",")).join("\n");
  return `${header}\n${body}`;
}

export async function bulkUpdateProducts({ productIds, action, categoryId, adminUserId }) {
  if (!productIds?.length) {
    throw new AppError("Select at least one product.", 400, "VALIDATION_ERROR");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  if (products.length === 0) {
    throw new AppError("No matching products found.", 404, "PRODUCT_NOT_FOUND");
  }

  let data = {};
  switch (action) {
    case "archive":
      data = { status: "ARCHIVED" };
      break;
    case "enable":
      data = { status: "ACTIVE" };
      break;
    case "disable":
      data = { status: "DRAFT" };
      break;
    case "feature":
      data = { isFeatured: true };
      break;
    case "unfeature":
      data = { isFeatured: false };
      break;
    case "changeCategory":
      if (!categoryId) {
        throw new AppError("categoryId is required for changeCategory.", 400, "VALIDATION_ERROR");
      }
      data = { categoryId };
      break;
    case "delete":
      await prisma.product.deleteMany({ where: { id: { in: productIds } } });
      await auditLogService.record({
        adminUserId,
        action: AUDIT_ACTIONS.PRODUCT_BULK,
        entityType: "product",
        metadata: { action, count: products.length, productIds },
      });
      return { action, affected: products.length, deleted: true };
    default:
      throw new AppError("Invalid bulk action.", 400, "VALIDATION_ERROR");
  }

  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data,
  });

  await auditLogService.record({
    adminUserId,
    action: AUDIT_ACTIONS.PRODUCT_BULK,
    entityType: "product",
    metadata: { action, count: result.count, productIds, categoryId: categoryId ?? null },
  });

  return { action, affected: result.count };
}

export async function exportProductsCsv(filters = {}) {
  const { listAdminProducts } = await import("./adminDashboardService.js");
  const result = await listAdminProducts({ ...filters, limit: 10000, page: 1 });
  const products = result.products ?? result;

  const columns = [
    { label: "ID", value: (p) => p.id },
    { label: "Name", value: (p) => p.name },
    { label: "SKU", value: (p) => p.sku },
    { label: "Brand", value: (p) => p.brand },
    { label: "Category", value: (p) => p.category?.name ?? "" },
    { label: "Price", value: (p) => p.price },
    { label: "Status", value: (p) => p.status },
    { label: "Stock", value: (p) => p.stockQuantity ?? 0 },
    { label: "Featured", value: (p) => (p.isFeatured ? "Yes" : "No") },
    { label: "Created", value: (p) => p.createdAt ?? "" },
  ];

  return rowsToCsv(products, columns);
}

export async function exportCustomersCsv(filters = {}) {
  const { listAdminCustomers } = await import("./adminDashboardService.js");
  const result = await listAdminCustomers({ ...filters, limit: 10000, page: 1 });
  const customers = result.customers ?? result;

  const columns = [
    { label: "ID", value: (c) => c.id },
    { label: "Email", value: (c) => c.email },
    { label: "Name", value: (c) => c.displayName ?? "" },
    { label: "Phone", value: (c) => c.phoneNumber ?? "" },
    { label: "Role", value: (c) => c.role },
    { label: "Active", value: (c) => (c.isActive ? "Yes" : "No") },
    { label: "Orders", value: (c) => c.orderCount ?? 0 },
    { label: "Joined", value: (c) => c.createdAt },
  ];

  return rowsToCsv(customers, columns);
}

export async function exportInventoryCsv() {
  const { listAdminInventory } = await import("./adminDashboardService.js");
  const inventory = await listAdminInventory();

  const columns = [
    { label: "Product ID", value: (r) => r.id },
    { label: "Name", value: (r) => r.name },
    { label: "SKU", value: (r) => r.sku },
    { label: "Category", value: (r) => r.category?.name ?? "" },
    { label: "Status", value: (r) => r.status },
    { label: "Quantity", value: (r) => r.inventory?.quantity ?? 0 },
    { label: "Reserved", value: (r) => r.inventory?.reservedQuantity ?? 0 },
    { label: "Low Stock Threshold", value: (r) => r.inventory?.lowStockThreshold ?? 5 },
    { label: "In Stock", value: (r) => (r.inventory?.isInStock ? "Yes" : "No") },
  ];

  return rowsToCsv(inventory, columns);
}

export async function exportToExcel(sheetName, rows, columns) {
  const XLSX = await import("xlsx");
  const data = rows.map((row) => {
    const entry = {};
    for (const col of columns) {
      entry[col.label] = col.value(row);
    }
    return entry;
  });
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function exportProductsExcel(filters = {}) {
  const { listAdminProducts } = await import("./adminDashboardService.js");
  const result = await listAdminProducts({ ...filters, limit: 10000, page: 1 });
  const products = result.products ?? result;
  const columns = [
    { label: "ID", value: (p) => p.id },
    { label: "Name", value: (p) => p.name },
    { label: "SKU", value: (p) => p.sku },
    { label: "Brand", value: (p) => p.brand },
    { label: "Category", value: (p) => p.category?.name ?? "" },
    { label: "Price", value: (p) => p.price },
    { label: "Status", value: (p) => p.status },
    { label: "Stock", value: (p) => p.stockQuantity ?? 0 },
    { label: "Featured", value: (p) => (p.isFeatured ? "Yes" : "No") },
  ];
  return exportToExcel("Products", products, columns);
}

export const adminExportService = {
  bulkUpdateProducts,
  exportProductsCsv,
  exportCustomersCsv,
  exportInventoryCsv,
  exportProductsExcel,
  exportToExcel,
};

export default adminExportService;
