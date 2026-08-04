import React, { useEffect, useState } from "react";
import { fetchAdminInventory, updateAdminInventory } from "../../services/adminApiService";
import {
  AdminPageHeader,
  AdminTable,
  AdminInput,
  AdminStatusBadge,
} from "../admin-ui";

function stockClass(item) {
  if (!item.inventory?.isInStock) return "adm-stock--out";
  if (item.inventory?.isLowStock) return "adm-stock--low";
  return "adm-stock--ok";
}

function stockLabel(item) {
  if (!item.inventory?.isInStock) return "Out of Stock";
  if (item.inventory?.isLowStock) return "Low Stock";
  return "In Stock";
}

const AdminInventoryView = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminInventory();
      setItems(Array.isArray(data) ? data : data.inventory ?? []);
    } catch (err) {
      setError(err.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q)
    );
  });

  const handleUpdate = async (productId, field, value) => {
    try {
      await updateAdminInventory(productId, { [field]: Number(value) });
      await loadInventory();
    } catch (err) {
      window.alert(err.message || "Failed to update inventory.");
    }
  };

  const columns = [
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <div>
          <div className="adm-table-product__name">{row.name}</div>
          <div className="adm-table-product__meta">{row.sku}</div>
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Current Stock",
      render: (row) => (
        <AdminInput
          type="number"
          min="0"
          defaultValue={row.inventory.quantity}
          onBlur={(e) => handleUpdate(row.id, "quantity", e.target.value)}
          aria-label={`Stock for ${row.name}`}
        />
      ),
    },
    {
      key: "reserved",
      label: "Reserved",
      render: (row) => row.inventory.reservedQuantity,
    },
    {
      key: "available",
      label: "Available",
      render: (row) => Math.max(0, (row.inventory.quantity ?? 0) - (row.inventory.reservedQuantity ?? 0)),
    },
    {
      key: "threshold",
      label: "Low Stock Threshold",
      render: (row) => (
        <AdminInput
          type="number"
          min="0"
          defaultValue={row.inventory.lowStockThreshold}
          onBlur={(e) => handleUpdate(row.id, "lowStockThreshold", e.target.value)}
          aria-label={`Threshold for ${row.name}`}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={stockClass(row)}>
          <AdminStatusBadge status={stockLabel(row)} />
        </span>
      ),
    },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Inventory"
        subtitle="Monitor and update stock levels across your catalog"
        toolbar={
          <AdminInput
            type="search"
            placeholder="Search product or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search inventory"
          />
        }
      />

      {error && <div className="adm-alert">{error}</div>}

      <AdminTable
        columns={columns}
        rows={filtered}
        loading={loading}
        emptyTitle={search.trim() ? "No matching inventory" : "No inventory records"}
        emptyDescription={
          search.trim()
            ? "Try a different product name or SKU."
            : "Products will appear here once added to the catalog. Missing stock rows are created automatically."
        }
      />
    </div>
  );
};

export default AdminInventoryView;
