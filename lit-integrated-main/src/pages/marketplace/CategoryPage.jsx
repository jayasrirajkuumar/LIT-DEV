import React from "react";
import { useParams } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import ErrorState from "../../components/marketplace/ErrorState";
import ProductSkeleton from "../../components/marketplace/ProductSkeleton";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import { getCategoryBySlug, getProductsByCategory } from "../../services/catalogApiService";
import ProductListingView from "./ProductListingView";
import { CATEGORY_SPLIT_DATA } from "../../data/marketplace/luxuryData";

const CategoryPage = () => {
  const { slug } = useParams();
  const categoryQuery = useCatalogQuery(`category:${slug}`, () => getCategoryBySlug(slug));

  const fallbackCategory = CATEGORY_SPLIT_DATA[slug]
    ? { name: slug.charAt(0).toUpperCase() + slug.slice(1), slug }
    : null;

  if (categoryQuery.loading && !fallbackCategory) {
    return (
      <MarketplaceLayout pageTitle="Loading..." backLabel="Back to Marketplace" backTo="/shop/products">
        <ProductSkeleton count={6} />
      </MarketplaceLayout>
    );
  }

  if (categoryQuery.error && !fallbackCategory) {
    return (
      <MarketplaceLayout backLabel="Back to Marketplace" backTo="/shop/products">
        <ErrorState
          message={categoryQuery.error.message}
          onRetry={categoryQuery.refetch}
        />
      </MarketplaceLayout>
    );
  }

  const category = categoryQuery.data || fallbackCategory;

  if (!category) {
    return (
      <MarketplaceLayout backLabel="Back to Marketplace" backTo="/shop/products">
        <ErrorState message="This collection is not available yet." onRetry={categoryQuery.refetch} />
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout pageTitle={category.name} backLabel="Back to Marketplace" backTo="/shop/products">
      <ProductListingView
        lockedCategorySlug={slug}
        sectionTitle={category.name}
        fetchProducts={(params) =>
          getProductsByCategory(slug, params).then(({ products, pagination }) => ({
            products,
            pagination,
          }))
        }
        emptyTitle={`No products in ${category.name}`}
        emptyMessage="This category is being curated. Browse other collections meanwhile."
      />
    </MarketplaceLayout>
  );
};

export default CategoryPage;
