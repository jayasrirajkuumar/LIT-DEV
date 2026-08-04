import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "./productService";
import {
  AdminCard,
  AdminCardHeader,
  AdminCardBody,
  AdminButton,
  AdminBadge,
  AdminStatusBadge,
  AdminSkeletonCard,
} from "../admin-ui";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        if (!data) setError("Product not found.");
        else setProduct(data);
      })
      .catch((err) => setError(err.message || "Failed to load product."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="adm-page">
        <AdminSkeletonCard lines={6} />
      </div>
    );
  }

  if (error || !product) {
    return <div className="adm-page"><div className="adm-alert">{error || "Product not found."}</div></div>;
  }

  const mainImage = product.primaryImage || product.images?.[0]?.imageUrl;

  return (
    <div className="adm-page">
      <div className="adm-grid adm-grid--2">
        <AdminCard padding="none" className="adm-product-preview__frame">
          <div className="adm-product-preview__image-wrap">
            <img src={mainImage || "/placeholder-product.png"} alt={product.name} />
          </div>
        </AdminCard>

        <AdminCard padding="md">
          <AdminCardHeader
            title={product.name}
            subtitle={product.brand}
            action={
              <AdminButton onClick={() => navigate(`/admin/ecomDashboard/products/edit/${product.id}`)}>
                Edit Product
              </AdminButton>
            }
          />
          <AdminCardBody>
            <p className="adm-product-preview__price">₹{product.price}</p>
            <div className="adm-product-preview__badges">
              <AdminStatusBadge status={product.status} />
              {product.isFeatured && <AdminBadge variant="featured">Featured</AdminBadge>}
              <AdminBadge variant={product.stockQuantity > 0 ? "success" : "danger"}>
                {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
              </AdminBadge>
            </div>
            <div className="adm-grid adm-grid--2" style={{ marginTop: 16 }}>
              <div><span className="adm-list__secondary">Category</span><div>{product.category?.name || "—"}</div></div>
              <div><span className="adm-list__secondary">SKU</span><div>{product.sku}</div></div>
            </div>
            <p style={{ marginTop: 16 }}>{product.description}</p>
            {product.images?.length > 0 && (
              <div className="adm-product-preview__gallery">
                {product.images.map((image) => (
                  <div key={image.id || image.imageUrl} className="adm-product-preview__thumb">
                    <img src={image.imageUrl} alt={image.altText || product.name} />
                  </div>
                ))}
              </div>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>
    </div>
  );
};

export default ProductDetailPage;
