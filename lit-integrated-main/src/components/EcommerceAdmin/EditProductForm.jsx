import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "./productService";
import { fetchAdminCategories } from "../../services/adminApiService";
import { mapApiProductToForm } from "./productFormMapper";
import ProductImageGallery from "./ProductImageGallery";
import {
  AdminButton,
  AdminFormSection,
  AdminFormField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminSwitch,
  ProductPreviewPanel,
  AdminSkeletonForm,
} from "../admin-ui";

const EditProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProductById(id), fetchAdminCategories()])
      .then(([product, categoryList]) => {
        setCategories(Array.isArray(categoryList) ? categoryList : []);
        if (product) setFormData(mapApiProductToForm(product));
        else setError("Product not found.");
      })
      .catch((err) => setError(err.message || "Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await updateProduct(id, formData);
      navigate("/admin/ecomDashboard/products");
    } catch (err) {
      setError(err.message || "Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-page">
        <AdminSkeletonForm fields={8} />
      </div>
    );
  }

  if (error && !formData) {
    return <div className="adm-page"><div className="adm-alert">{error}</div></div>;
  }

  return (
    <div className="adm-page">
      {error && <div className="adm-alert">{error}</div>}
      <form className="adm-grid adm-grid--form-split" onSubmit={handleSubmit}>
        <div className="adm-page" style={{ gap: 16 }}>
          <AdminFormSection title="Basic Information">
            <div className="adm-form-row">
              <AdminFormField label="Product Name" required>
                <AdminInput name="productName" value={formData.productName} onChange={handleChange} required />
              </AdminFormField>
              <AdminFormField label="SKU" required>
                <AdminInput name="sku" value={formData.sku} onChange={handleChange} required />
              </AdminFormField>
            </div>
            <div className="adm-form-row">
              <AdminFormField label="Brand" required>
                <AdminInput name="brand" value={formData.brand} onChange={handleChange} required />
              </AdminFormField>
              <AdminFormField label="Category" required>
                <AdminSelect name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </AdminSelect>
              </AdminFormField>
            </div>
            <AdminFormField label="Description" required>
              <AdminTextarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
            </AdminFormField>
          </AdminFormSection>

          <AdminFormSection title="Pricing">
            <div className="adm-form-row">
              <AdminFormField label="Price (₹)" required>
                <AdminInput type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" required />
              </AdminFormField>
              <AdminFormField label="Discount (%)">
                <AdminInput type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} min="0" max="99" />
              </AdminFormField>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Inventory">
            <AdminFormField label="Stock Quantity" required>
              <AdminInput type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
            </AdminFormField>
          </AdminFormSection>

          <AdminFormSection title="Images" description="Upload, reorder, and set primary image">
            <ProductImageGallery
              entries={formData.imageEntries}
              productName={formData.productName}
              onChange={(imageEntries) => setFormData((prev) => ({ ...prev, imageEntries }))}
            />
          </AdminFormSection>

          <AdminFormSection title="Publishing">
            <div className="adm-form-row">
              <AdminFormField label="Status">
                <AdminSelect name="status" value={formData.status} onChange={handleChange}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="ARCHIVED">Archived</option>
                </AdminSelect>
              </AdminFormField>
              <AdminSwitch
                label="Featured product"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              />
            </div>
          </AdminFormSection>

          <div style={{ display: "flex", gap: 12 }}>
            <AdminButton variant="ghost" type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </AdminButton>
            <AdminButton type="submit" loading={isSubmitting}>
              Save Changes
            </AdminButton>
          </div>
        </div>

        <ProductPreviewPanel formData={formData} categories={categories} />
      </form>
    </div>
  );
};

export default EditProductForm;
