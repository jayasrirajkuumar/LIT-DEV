import { adminExportService } from "../services/adminExportService.js";
import { exportAdminOrders } from "../services/adminOrderService.js";

export async function bulkProducts(req, res) {
  const result = await adminExportService.bulkUpdateProducts({
    productIds: req.validatedBody.productIds,
    action: req.validatedBody.action,
    categoryId: req.validatedBody.categoryId,
    adminUserId: req.dbUser.id,
  });
  res.json({ success: true, data: result });
}

export async function exportProducts(req, res) {
  const format = req.query.format || "csv";
  const filters = req.validatedQuery ?? {};

  if (format === "xlsx" || format === "excel") {
    const buffer = await adminExportService.exportProductsExcel(filters);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=lit-products.xlsx");
    res.send(buffer);
    return;
  }

  const csv = await adminExportService.exportProductsCsv(filters);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=lit-products.csv");
  res.send(csv);
}

export async function exportCustomers(req, res) {
  const format = req.query.format || "csv";
  const filters = req.validatedQuery ?? {};
  const csv = await adminExportService.exportCustomersCsv(filters);

  if (format === "xlsx" || format === "excel") {
    const { listAdminCustomers } = await import("../services/adminDashboardService.js");
    const result = await listAdminCustomers({ ...filters, page: 1, limit: 10000 });
    const customers = result.customers ?? result;
    const buffer = await adminExportService.exportToExcel("Customers", customers, [
      { label: "Email", value: (c) => c.email },
      { label: "Name", value: (c) => c.displayName ?? "" },
      { label: "Active", value: (c) => (c.isActive ? "Yes" : "No") },
      { label: "Orders", value: (c) => c.orderCount ?? 0 },
    ]);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=lit-customers.xlsx");
    res.send(buffer);
    return;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=lit-customers.csv");
  res.send(csv);
}

export async function exportInventory(req, res) {
  const format = req.query.format || "csv";
  const csv = await adminExportService.exportInventoryCsv();

  if (format === "xlsx" || format === "excel") {
    const { listAdminInventory } = await import("../services/adminDashboardService.js");
    const inventory = await listAdminInventory();
    const rows = Array.isArray(inventory) ? inventory : inventory.inventory;
    const buffer = await adminExportService.exportToExcel("Inventory", rows, [
      { label: "Name", value: (r) => r.name },
      { label: "SKU", value: (r) => r.sku },
      { label: "Quantity", value: (r) => r.inventory?.quantity ?? 0 },
    ]);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=lit-inventory.xlsx");
    res.send(buffer);
    return;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=lit-inventory.csv");
  res.send(csv);
}

export async function exportOrdersExcel(req, res) {
  const filters = req.validatedQuery ?? {};
  const csv = await exportAdminOrders(filters);
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h.replace(/"/g, "")] = values[i]?.replace(/"/g, "") ?? "";
    });
    return row;
  });
  const buffer = await adminExportService.exportToExcel(
    "Orders",
    rows,
    headers.map((h) => ({ label: h.replace(/"/g, ""), value: (r) => r[h.replace(/"/g, "")] })),
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", "attachment; filename=lit-orders.xlsx");
  res.send(buffer);
}

export default {
  bulkProducts,
  exportProducts,
  exportCustomers,
  exportInventory,
  exportOrdersExcel,
};
