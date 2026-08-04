import React, { useEffect, useState } from "react";
import { fetchAdminWishlistCollections } from "../../services/adminApiService";
import { AdminPageHeader, AdminTable } from "../admin-ui";

const AdminWishlistCollectionsView = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminWishlistCollections()
      .then((data) => setCollections(data.collections ?? []))
      .catch((err) => setError(err.message || "Failed to load wishlist collections."))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: "name", label: "Collection" },
    {
      key: "user",
      label: "Customer",
      render: (row) => row.user?.email || row.user?.displayName || "—",
    },
    { key: "itemCount", label: "Items" },
    {
      key: "isDefault",
      label: "Default",
      render: (row) => (row.isDefault ? "Yes" : "No"),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (row) => new Date(row.updatedAt).toLocaleString(),
    },
  ];

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Wishlist Collections"
        subtitle="Read-only view of customer wishlist collections."
      />
      {error && <p className="adm-alert adm-alert--error">{error}</p>}
      <AdminTable columns={columns} rows={collections} loading={loading} emptyTitle="No collections found." />
    </div>
  );
};

export default AdminWishlistCollectionsView;
