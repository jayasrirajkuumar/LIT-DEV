import React, { useEffect } from "react";
import CatalogFilters from "../../components/marketplace/CatalogFilters";
import CatalogToolbar from "../../components/marketplace/CatalogToolbar";
import EmptyState from "../../components/marketplace/EmptyState";
import ErrorState from "../../components/marketplace/ErrorState";
import Pagination from "../../components/marketplace/Pagination";
import ProductGrid from "../../components/marketplace/ProductGrid";
import ProductSkeleton from "../../components/marketplace/ProductSkeleton";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import { useMarketplaceConfig } from "../../hooks/useMarketplaceConfig";
import { getCategories } from "../../services/catalogApiService";
import { LUXURY_PRODUCTS } from "../../data/marketplace/luxuryData";
import useCatalogFilters from "./useCatalogFilters";

const ProductListingView = ({
  fetchProducts,
  lockedCategorySlug = "",
  emptyTitle = "No products found",
  emptyMessage = "Try adjusting your filters or browse another category.",
  sectionTitle = "All Products",
}) => {
  const {
    filters,
    draft,
    setDraft,
    syncDraft,
    applyFilters,
    resetFilters,
    setPage,
    setSort,
    apiParams,
    queryKey,
    showFilters,
    setShowFilters,
  } = useCatalogFilters({ category: lockedCategorySlug });

  const { sortOptions, filterOptions } = useMarketplaceConfig();
  const categoriesQuery = useCatalogQuery("categories", getCategories);
  const productsQuery = useCatalogQuery(`products:${queryKey}`, () => fetchProducts(apiParams));

  useEffect(() => {
    if (showFilters) syncDraft();
  }, [showFilters, syncDraft]);

  const handleRetry = () => {
    categoriesQuery.refetch();
    productsQuery.refetch();
  };

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const rawProducts = productsQuery.data?.products || [];
  const products = rawProducts.length > 0 ? rawProducts : LUXURY_PRODUCTS.map((p) => ({
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    price: p.price,
    comparePrice: p.originalPrice,
    currency: "INR",
    images: [{ url: p.image }],
    category: { name: p.category.toUpperCase(), slug: p.category },
    gender: p.gender,
    inventory: { isInStock: true, quantity: p.stock },
  }));
  const pagination = productsQuery.data?.pagination || { page: 1, total: products.length, totalPages: 1 };
  // Local luxury products keep the page useful while the API warms up. The
  // toolbar and route progress indicator still communicate navigation state.
  const loading = productsQuery.loading && products.length === 0;
  const error = productsQuery.error && products.length === 0 ? productsQuery.error : null;

  return (
    <>
      <CatalogToolbar
        total={pagination?.total ?? products.length}
        sort={filters.sort}
        onSortChange={setSort}
        onToggleFilters={() => setShowFilters((value) => !value)}
        sortOptions={sortOptions}
      />

      <div className={`mp-layout ${showFilters ? "filters-open" : ""}`}>
        <CatalogFilters
          categories={categories}
          filters={draft}
          onChange={setDraft}
          onApply={() => applyFilters({ ...draft, page: 1 })}
          onReset={resetFilters}
          lockedCategorySlug={lockedCategorySlug}
          filterOptions={filterOptions}
        />

        <section className="mp-results">
          {loading && <ProductSkeleton count={6} />}
          {!loading && error && (
            <ErrorState message={error.message} onRetry={handleRetry} />
          )}
          {!loading && !error && products.length === 0 && (
            <EmptyState title={emptyTitle} message={emptyMessage} />
          )}
          {!loading && !error && products.length > 0 && (
            <>
              <ProductGrid products={products} title={sectionTitle} />
              <Pagination pagination={pagination} onPageChange={setPage} />
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default ProductListingView;
