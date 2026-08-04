import React, { useEffect, useState } from "react";
import {
  fetchAdminMarketplaceConfig,
  patchAdminSortOption,
  patchAdminFilterOption,
  postAdminAnnouncement,
  patchAdminAnnouncement,
  deleteAdminAnnouncement,
  postAdminBrand,
  patchAdminBrand,
  deleteAdminBrand,
} from "../../services/adminApiService";
import {
  AdminPageHeader,
  AdminFormSection,
  AdminFormField,
  AdminInput,
  AdminSwitch,
  AdminButton,
  AdminTable,
  AdminSkeletonForm,
} from "../admin-ui";

const AdminMarketplaceView = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () =>
    fetchAdminMarketplaceConfig()
      .then(setConfig)
      .catch((err) => setError(err.message || "Failed to load marketplace config."));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const run = async (action) => {
    try {
      setBusy(true);
      setError("");
      await action();
      await load();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-page">
        <AdminSkeletonForm fields={6} />
      </div>
    );
  }

  const announcements = config?.announcements ?? [];
  const brands = config?.brands ?? [];
  const sortOptions = config?.sortOptions ?? [];
  const filterOptions = config?.filterOptions ?? [];

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Marketplace Configuration"
        subtitle="Manage announcement bar, brands, sort options, and filters."
      />
      {error && <p className="adm-alert adm-alert--error">{error}</p>}

      <AdminFormSection title="Announcements">
        <div className="adm-inline-form">
          <AdminInput
            placeholder="New announcement message"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          />
          <AdminButton
            loading={busy}
            onClick={() =>
              run(async () => {
                await postAdminAnnouncement({ message: announcementText.trim(), sortOrder: announcements.length });
                setAnnouncementText("");
              })
            }
          >
            Add
          </AdminButton>
        </div>
        <AdminTable
          columns={[
            { key: "message", label: "Message" },
            {
              key: "isActive",
              label: "Active",
              render: (row) => (
                <AdminSwitch
                  checked={row.isActive}
                  onChange={(e) =>
                    run(() => patchAdminAnnouncement(row.id, { isActive: e.target.checked }))
                  }
                />
              ),
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <AdminButton variant="ghost" size="sm" onClick={() => run(() => deleteAdminAnnouncement(row.id))}>
                  Delete
                </AdminButton>
              ),
            },
          ]}
          rows={announcements}
          emptyTitle="No announcements yet."
        />
      </AdminFormSection>

      <AdminFormSection title="Brands">
        <div className="adm-inline-form">
          <AdminInput placeholder="Brand name" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          <AdminInput placeholder="Logo URL" value={brandLogo} onChange={(e) => setBrandLogo(e.target.value)} />
          <AdminButton
            loading={busy}
            onClick={() =>
              run(async () => {
                await postAdminBrand({ name: brandName.trim(), logoUrl: brandLogo.trim() || null, sortOrder: brands.length });
                setBrandName("");
                setBrandLogo("");
              })
            }
          >
            Add Brand
          </AdminButton>
        </div>
        <AdminTable
          columns={[
            { key: "name", label: "Brand" },
            { key: "slug", label: "Slug" },
            {
              key: "isActive",
              label: "Active",
              render: (row) => (
                <AdminSwitch
                  checked={row.isActive}
                  onChange={(e) => run(() => patchAdminBrand(row.id, { isActive: e.target.checked }))}
                />
              ),
            },
            {
              key: "actions",
              label: "",
              render: (row) => (
                <AdminButton variant="ghost" size="sm" onClick={() => run(() => deleteAdminBrand(row.id))}>
                  Delete
                </AdminButton>
              ),
            },
          ]}
          rows={brands}
          emptyTitle="No brands configured."
        />
      </AdminFormSection>

      <AdminFormSection title="Sort Options">
        <AdminTable
          columns={[
            { key: "label", label: "Label" },
            { key: "key", label: "Key" },
            {
              key: "isActive",
              label: "Enabled",
              render: (row) => (
                <AdminSwitch
                  checked={row.isActive}
                  onChange={(e) => run(() => patchAdminSortOption(row.id, { isActive: e.target.checked }))}
                />
              ),
            },
          ]}
          rows={sortOptions}
          emptyTitle="No sort options."
        />
      </AdminFormSection>

      <AdminFormSection title="Filter Options">
        <AdminTable
          columns={[
            { key: "label", label: "Label" },
            { key: "key", label: "Key" },
            { key: "type", label: "Type" },
            {
              key: "isActive",
              label: "Enabled",
              render: (row) => (
                <AdminSwitch
                  checked={row.isActive}
                  onChange={(e) => run(() => patchAdminFilterOption(row.id, { isActive: e.target.checked }))}
                />
              ),
            },
          ]}
          rows={filterOptions}
          emptyTitle="No filter options."
        />
      </AdminFormSection>
    </div>
  );
};

export default AdminMarketplaceView;
