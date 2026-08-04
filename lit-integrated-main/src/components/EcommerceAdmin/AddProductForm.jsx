import React, { useEffect, useState } from "react";
import { createProduct } from "./productService";
import { fetchAdminCategories } from "../../services/adminApiService";
import {
  AdminModal,
  AdminButton,
  AdminFormSection,
  AdminFormField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminSwitch,
  ProductPreviewPanel,
} from "../admin-ui";
import ProductImageGallery from "./ProductImageGallery";

const INITIAL_FORM = {
  productName: "",
  sku: "",
  brand: "",
  categoryId: "",
  originalPrice: "",
  discountPercentage: "",
  shortDescription: "",
  description: "",
  stock: "",
  status: "DRAFT",
  isFeatured: false,
  imageEntries: [],
};

const AddProductForm = ({ isOpen, onClose, onProductAdd }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    fetchAdminCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
    setFormData(INITIAL_FORM);
    setError("");
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await createProduct(formData);
      onProductAdd();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminModal
      open={isOpen}
      onClose={onClose}
      title="Add Product"
      description="Create a new catalog item for the LIT marketplace"
      size="lg"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </AdminButton>
          <AdminButton loading={isSubmitting} onClick={handleSubmit}>
            Create Product
          </AdminButton>
        </>
      }
    >
      {error && <div className="adm-alert">{error}</div>}
      <form className="adm-grid adm-grid--form-split" onSubmit={handleSubmit}>
        <div className="adm-page" style={{ gap: 16 }}>
          <AdminFormSection title="Basic Information" description="Core product details">
            <div className="adm-form-row">
              <AdminFormField label="Product Name" required>
                <AdminInput name="productName" value={formData.productName} onChange={handleChange} required />
              </AdminFormField>
              <AdminFormField label="SKU" hint="Auto-generated if empty">
                <AdminInput name="sku" value={formData.sku} onChange={handleChange} />
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
            <AdminFormField label="Short Description">
              <AdminInput name="shortDescription" value={formData.shortDescription} onChange={handleChange} />
            </AdminFormField>
            <AdminFormField label="Description" required>
              <AdminTextarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
            </AdminFormField>
          </AdminFormSection>

          <AdminFormSection title="Pricing" description="Set price and promotional compare price">
            <div className="adm-form-row">
              <AdminFormField label="Price (₹)" required>
                <AdminInput type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" required />
              </AdminFormField>
              <AdminFormField label="Discount (%)" hint="Used to calculate compare-at price">
                <AdminInput type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} min="0" max="99" />
              </AdminFormField>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Inventory" description="Stock levels for fulfillment">
            <AdminFormField label="Stock Quantity" required>
              <AdminInput type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
            </AdminFormField>
          </AdminFormSection>

          <AdminFormSection title="Images" description="Upload product images to Azure Blob Storage">
            <ProductImageGallery
              entries={formData.imageEntries}
              productName={formData.productName}
              onChange={(imageEntries) => setFormData((prev) => ({ ...prev, imageEntries }))}
            />
          </AdminFormSection>

          <AdminFormSection title="Publishing" description="Visibility and merchandising flags">
            <div className="adm-form-row">
              <AdminFormField label="Status">
                <AdminSelect name="status" value={formData.status} onChange={handleChange}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </AdminSelect>
              </AdminFormField>
              <AdminSwitch
                label="Featured product"
                checked={formData.isFeatured}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFeatured: e.target.checked }))}
              />
            </div>
          </AdminFormSection>
        </div>

        <ProductPreviewPanel formData={formData} categories={categories} />
      </form>
    </AdminModal>
  );
};

export default AddProductForm;
