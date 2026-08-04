import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import ErrorState from "../../components/marketplace/ErrorState";
import ProductDetailGallery from "../../components/marketplace/ProductDetailGallery";
import ProductSkeleton from "../../components/marketplace/ProductSkeleton";
import RecommendedProducts from "../../components/marketplace/RecommendedProducts";
import RecentlyViewed from "../../components/marketplace/RecentlyViewed";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import { useShopping } from "../../context/ShoppingContext";
import { getProductBySlug } from "../../services/catalogApiService";
import { formatCatalogPrice, getDiscountPercent } from "../../utils/catalogFormat";
import { trackRecentlyViewed } from "../../utils/recentlyViewed";

const CatalogProductPage = () => {
  const { slug } = useParams();
  const { addToCart, buyNow, toggleWishlist, isWishlisted } = useShopping();
  const [quantity, setQuantity] = useState(1);

  const { data: product, loading, error } = useCatalogQuery(`product:${slug}`, () =>
    getProductBySlug(slug),
  );

  useEffect(() => {
    if (product) {
      trackRecentlyViewed(product);
    }
  }, [product]);

  if (loading) {
    return (
      <MarketplaceLayout showSearch={false} backLabel="Back to Marketplace" backTo="/shop/products">
        <ProductSkeleton count={1} />
      </MarketplaceLayout>
    );
  }

  if (error || !product) {
    return (
      <MarketplaceLayout showSearch={false} backLabel="Back to Marketplace" backTo="/shop/products">
        <ErrorState message={error?.message || "Product not found."} onRetry={() => window.location.reload()} />
      </MarketplaceLayout>
    );
  }

  const discount = getDiscountPercent(product.price, product.comparePrice);
  const inStock = product.inventory?.isInStock ?? product.status !== "OUT_OF_STOCK";
  const wishlisted = isWishlisted(product.id);

  return (
    <MarketplaceLayout showSearch={false} backLabel="Back to Marketplace" backTo="/shop/products">
      <div className="mp-product-detail-page">
        <ProductDetailGallery images={product.images} productName={product.name} />

        <aside className="mp-detail-sticky">
          <div className="mp-detail-panel">
            {product.category && (
              <Link to={`/shop/category/${product.category.slug}`} className="mp-detail-category-link">
                {product.category.name}
              </Link>
            )}

            <p className="mp-detail-brand">{product.brand}</p>
            <h1 className="mp-detail-title">{product.name}</h1>

            <div className="mp-detail-rating" aria-label="LIT curated product">
              <span className="mp-curated-badge">LIT Curated</span>
              <span className="mp-rating-stars" aria-hidden="true">★★★★★</span>
            </div>

            <p className="mp-detail-short">{product.shortDescription}</p>

            <div className="mp-price-row">
              <span className="mp-current-price mp-current-price-lg">
                {formatCatalogPrice(product.price, product.currency)}
              </span>
              {discount && <span className="mp-discount">{discount}% OFF</span>}
            </div>

            {product.comparePrice && (
              <div className="mp-original-price">
                {formatCatalogPrice(product.comparePrice, product.currency)}
              </div>
            )}

            <p className={inStock ? "mp-stock-in" : "mp-stock-out"}>
              {inStock ? "In stock" : "Out of stock"}
              {inStock && product.inventory?.quantity ? ` · ${product.inventory.quantity} available` : ""}
            </p>

            <div className="mp-quantity-row">
              <label htmlFor="mp-quantity">Quantity</label>
              <div className="mp-quantity-control">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
                <input id="mp-quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} />
                <button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div className="mp-detail-actions">
              <motion.button type="button" className="mp-buy-now" disabled={!inStock} onClick={() => buyNow(product.id, quantity)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Buy Now
              </motion.button>
              <motion.button type="button" className="mp-add-to-cart" disabled={!inStock} onClick={() => addToCart(product.id, quantity)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Add to Cart
              </motion.button>
            </div>

            <button type="button" className={`mp-wishlist-text-btn ${wishlisted ? "active" : ""}`} onClick={() => toggleWishlist(product.id)}>
              {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
            </button>

            <div className="mp-detail-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="mp-detail-description">
              <h3>Shipping Information</h3>
              <p>Complimentary insured shipping across India. Delivery in 3–7 business days for in-stock luxury items.</p>
            </div>

            <dl className="mp-detail-meta">
              <div><dt>SKU</dt><dd>{product.sku}</dd></div>
              {product.weight && <div><dt>Weight</dt><dd>{product.weight} g</dd></div>}
              {product.dimensions && <div><dt>Dimensions</dt><dd>{JSON.stringify(product.dimensions)}</dd></div>}
            </dl>
          </div>
        </aside>
      </div>

      <RecommendedProducts categorySlug={product.category?.slug} excludeProductId={product.id} />
      <RecentlyViewed excludeProductId={product.id} />
    </MarketplaceLayout>
  );
};

export default CatalogProductPage;
