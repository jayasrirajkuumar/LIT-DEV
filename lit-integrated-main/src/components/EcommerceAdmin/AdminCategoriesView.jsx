import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../services/catalogApiService";
import { fetchAdminCategories } from "../../services/adminApiService";
import {
  AdminPageHeader,
  AdminButton,
  AdminModal,
  AdminFormField,
  AdminInput,
  AdminTextarea,
  AdminSwitch,
  AdminCard,
  AdminBadge,
  AdminEmptyState,
  AdminSkeletonCard,
} from "../admin-ui";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  displayOrder: 0,
  isActive: true,
};

const AdminCategoriesView = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.slug?.toLowerCase().includes(term),
    );
  }, [categories, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      displayOrder: category.displayOrder ?? 0,
      isActive: category.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: Boolean(form.isActive),
      };
      if (editingId) await updateCategory(editingId, payload);
      else await createCategory(payload);
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (category) => {
    try {
      await updateCategory(category.id, { isActive: !category.isActive });
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to update status.");
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category.");
    }
  };

  return (
    <div className="adm-page">
      <AdminPageHeader
        title="Categories"
        subtitle="Organize your catalog with display order and visibility"
        actions={
          <AdminButton icon={<Plus size={16} />} onClick={openAdd}>
            Add Category
          </AdminButton>
        }
        toolbar={
          <AdminInput
            type="search"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search categories"
          />
        }
      />

      {error && <div className="adm-alert">{error}</div>}

      {loading ? (
        <div className="adm-grid adm-grid--3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AdminSkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          title="No categories found"
          description="Create your first category to organize products."
          actionLabel="Add Category"
          onAction={openAdd}
        />
      ) : (
        <div className="adm-grid adm-grid--3">
          {filtered.map((category) => (
            <AdminCard key={category.id} hover className="adm-category-card" padding="none">
              <div className="adm-category-card__image">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} />
                ) : (
                  <div className="adm-product-preview__placeholder">No image</div>
                )}
              </div>
              <div className="adm-category-card__body">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{category.name}</h3>
                    <p className="adm-list__secondary">{category.slug}</p>
                  </div>
                  <AdminBadge variant={category.isActive ? "success" : "neutral"}>
                    {category.isActive ? "Active" : "Disabled"}
                  </AdminBadge>
                </div>
                <p className="adm-list__secondary">
                  {category.productCount ?? 0} products · Order {category.displayOrder}
                </p>
                <div className="adm-category-card__actions">
                  <AdminButton size="sm" variant="outline" onClick={() => openEdit(category)}>
                    Edit
                  </AdminButton>
                  <AdminButton size="sm" variant="secondary" onClick={() => handleToggle(category)}>
                    {category.isActive ? "Disable" : "Enable"}
                  </AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => handleDelete(category)}>
                    Delete
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Category" : "Add Category"}
        size="md"
        footer={
          <>
            <AdminButton variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </AdminButton>
            <AdminButton loading={saving} onClick={handleSubmit}>
              {editingId ? "Save Changes" : "Create Category"}
            </AdminButton>
          </>
        }
      >
        <form className="adm-page" style={{ gap: 16 }} onSubmit={handleSubmit}>
          <AdminFormField label="Name" required>
            <AdminInput value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          </AdminFormField>
          <AdminFormField label="Slug" hint="Auto-generated if empty">
            <AdminInput value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="Description">
            <AdminTextarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </AdminFormField>
          <AdminFormField label="Image URL">
            <AdminInput type="url" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
          </AdminFormField>
          <AdminFormField label="Display Order">
            <AdminInput type="number" min="0" value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))} />
          </AdminFormField>
          <AdminSwitch
            label="Active"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
          />
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminCategoriesView;
