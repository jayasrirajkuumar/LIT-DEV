import React, { memo } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import { getFeaturedProducts, getProductsByCategory } from "../../services/catalogApiService";

const RecommendedProducts = memo(({ categorySlug, excludeProductId }) => {
  const queryKey = categorySlug
    ? `recommended:cat:${categorySlug}:${excludeProductId}`
    : `recommended:featured:${excludeProductId}`;

  const { data, loading, error } = useCatalogQuery(queryKey, async () => {
    const result = categorySlug
      ? await getProductsByCategory(categorySlug, { limit: 8 })
      : await getFeaturedProducts(8);

    return {
      products: (result.products || []).filter((item) => item.id !== excludeProductId).slice(0, 4),
    };
  });

  if (loading) return <ProductSkeleton count={4} />;
  if (error || !data?.products?.length) return null;

  return (
    <motion.section
      className="mp-recommended-section"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mp-section-title">You May Also Like</h2>
      <div className="mp-product-list-container">
        <div className="mp-product-grid mp-product-grid-compact">
          {data.products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
});

RecommendedProducts.displayName = "RecommendedProducts";

export default RecommendedProducts;
