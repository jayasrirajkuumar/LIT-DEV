import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminCarts } from "../../services/adminApiService";
import { AdminPageHeader, AdminTable, AdminStatusBadge } from "../admin-ui";
import { formatCatalogPrice } from "../../utils/catalogFormat";

const AdminCartsView = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminCarts()
      .then((data) => setCarts(data.carts ?? []))
      .catch((err) => setError(err.message || "Failed to load carts."))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "user",
      label: "Customer",
      render: (row) => row.user?.displayName || row.user?.email || "—",
    },
    {
      key: "items",
      label: "Products",
      render: (row) => (
        <ul className="adm-inline-list">
          {(row.items ?? []).map((item) => (
            <li key={`${row.id}-${item.productId}`}>
              <Link to={item.link} target="_blank" rel="noreferrer">
                {item.name}
              </Link>{" "}
              × {item.quantity}
            </li>
          ))}
        </ul>
      ),
    },
    { key: "itemCount", label: "Qty Total" },
    {
      key: "subtotal",
      label: "Subtotal",
      render: (row) => formatCatalogPrice(row.subtotal, "INR"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <AdminStatusBadge status={row.status} />,
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (row) => new Date(row.updatedAt).toLocaleString(),
    },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader title="Cart Management" subtitle="Active customer carts across the marketplace." />
      {error && <p className="adm-alert adm-alert--error">{error}</p>}
      <AdminTable columns={columns} rows={carts} loading={loading} emptyTitle="No active carts." />
    </div>
  );
};

export default AdminCartsView;
