import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminWishlistItems } from "../../services/adminApiService";
import { AdminPageHeader, AdminTable } from "../admin-ui";
import { formatCatalogPrice } from "../../utils/catalogFormat";

const AdminWishlistItemsView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminWishlistItems()
      .then((data) => setItems(data.items ?? []))
      .catch((err) => setError(err.message || "Failed to load wishlist items."))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: "user",
      label: "Customer",
      render: (row) => row.user?.displayName || row.user?.email || "—",
    },
    {
      key: "product",
      label: "Product",
      render: (row) => (
        <Link to={row.product.link} target="_blank" rel="noreferrer">
          {row.product.name}
        </Link>
      ),
    },
    { key: "collection", label: "Collection" },
    {
      key: "price",
      label: "Price",
      render: (row) => formatCatalogPrice(row.product.price, "INR"),
    },
    {
      key: "addedAt",
      label: "Date Added",
      render: (row) => new Date(row.addedAt).toLocaleString(),
    },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Wishlist Items"
        subtitle="Individual wishlist products saved by customers."
      />
      {error && <p className="adm-alert adm-alert--error">{error}</p>}
      <AdminTable columns={columns} rows={items} loading={loading} emptyTitle="No wishlist items yet." />
    </div>
  );
};

export default AdminWishlistItemsView;
