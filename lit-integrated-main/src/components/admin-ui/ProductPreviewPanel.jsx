import React from "react";
import AdminBadge, { AdminStatusBadge } from "./AdminBadge";
import AdminCard, { AdminCardHeader, AdminCardBody } from "./AdminCard";

export default function ProductPreviewPanel({ formData, categories = [] }) {
  const categoryName =
    categories.find((category) => category.id === formData?.categoryId)?.name ||
    "Category";

  const primaryImage =
    formData?.imageEntries?.find((entry) => entry.isPrimary)?.imageUrl ||
    formData?.imageEntries?.[0]?.imageUrl;

  const price = formData?.originalPrice || "0.00";

  return (
    <AdminCard className="adm-product-preview" padding="md">
      <AdminCardHeader title="Live Preview" subtitle="How this product may appear in the storefront" />
      <AdminCardBody>
        <div className="adm-product-preview__frame">
          <div className="adm-product-preview__image-wrap">
            {primaryImage ? (
              <img src={primaryImage} alt={formData?.productName || "Product preview"} />
            ) : (
              <div className="adm-product-preview__placeholder">Image preview</div>
            )}
          </div>
          <div className="adm-product-preview__meta">
            <span className="adm-product-preview__brand">{formData?.brand || "Brand"}</span>
            <h4>{formData?.productName || "Product name"}</h4>
            <p className="adm-product-preview__category">{categoryName}</p>
            <div className="adm-product-preview__price">₹{price}</div>
            <div className="adm-product-preview__badges">
              {formData?.isFeatured && <AdminBadge variant="featured">Featured</AdminBadge>}
              {formData?.status && <AdminStatusBadge status={formData.status} />}
              <AdminBadge variant={Number(formData?.stock) > 0 ? "success" : "danger"}>
                {Number(formData?.stock) > 0 ? `${formData.stock} in stock` : "Out of stock"}
              </AdminBadge>
            </div>
            <p className="adm-product-preview__desc">
              {formData?.description || "Product description will appear here."}
            </p>
          </div>
        </div>
        {(formData?.imageEntries?.length ?? 0) > 0 && (
          <div className="adm-product-preview__gallery">
            {formData.imageEntries.map((entry, index) => (
              <div key={`${entry.imageUrl}-${index}`} className="adm-product-preview__thumb">
                {entry.imageUrl ? (
                  <img src={entry.imageUrl} alt={entry.altText || `Image ${index + 1}`} />
                ) : (
                  <div className="adm-product-preview__placeholder">—</div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCardBody>
    </AdminCard>
  );
}
