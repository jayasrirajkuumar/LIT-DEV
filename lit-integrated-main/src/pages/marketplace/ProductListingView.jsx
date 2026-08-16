import React, { useCallback, useEffect, useRef } from "react";
import CatalogFilters from "../../components/marketplace/CatalogFilters";
import CatalogToolbar from "../../components/marketplace/CatalogToolbar";
import EmptyState from "../../components/marketplace/EmptyState";
import ErrorState from "../../components/marketplace/ErrorState";
import Pagination from "../../components/marketplace/Pagination";
import ProductGrid from "../../components/marketplace/ProductGrid";
import ProductSkeleton from "../../components/marketplace/ProductSkeleton";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import useMarketplaceConfig from "../../hooks/useMarketplaceConfig";
import { getCategories } from "../../services/catalogApiService";
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
  const fetchProductList = useCallback(
    () => fetchProducts(apiParams),
    [fetchProducts, apiParams],
  );
  const productsQuery = useCatalogQuery(`products:${queryKey}`, fetchProductList);
  const filtersRef = useRef(null);

  const closeFilters = useCallback(() => setShowFilters(false), [setShowFilters]);

  useEffect(() => {
    if (showFilters) syncDraft();
  }, [showFilters, syncDraft]);

  useEffect(() => {
    if (!showFilters) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeFilters();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showFilters, closeFilters]);

  useEffect(() => {
    if (!showFilters) return undefined;

    const isMobileDrawer = window.matchMedia("(max-width: 900px)").matches;
    if (isMobileDrawer) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    return undefined;
  }, [showFilters]);

  useEffect(() => {
    if (!showFilters || !filtersRef.current) return undefined;

    const isMobileDrawer = window.matchMedia("(max-width: 900px)").matches;
    if (!isMobileDrawer) return undefined;

    const panel = filtersRef.current;
    const focusable = panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleTab = (event) => {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    panel.addEventListener("keydown", handleTab);
    return () => panel.removeEventListener("keydown", handleTab);
  }, [showFilters]);

  const handleRetry = () => {
    categoriesQuery.refetch();
    productsQuery.refetch();
  };

  const categories = categoriesQuery.data || [];
  const products = productsQuery.data?.products || [];
  const pagination = productsQuery.data?.pagination;
  const loading = categoriesQuery.loading || productsQuery.loading;
  const error = categoriesQuery.error || productsQuery.error;

  return (
    <>
      <CatalogToolbar
        total={pagination?.total ?? products.length}
        sort={filters.sort}
        onSortChange={setSort}
        onToggleFilters={() => setShowFilters((value) => !value)}
        filtersOpen={showFilters}
        sortOptions={sortOptions}
      />

      <div className={`mp-layout ${showFilters ? "filters-open" : ""}`}>
        <button
          type="button"
          className="mp-filter-backdrop"
          aria-label="Close filters"
          tabIndex={showFilters ? 0 : -1}
          onClick={closeFilters}
        />

        <CatalogFilters
          ref={filtersRef}
          categories={categories}
          filters={draft}
          onChange={setDraft}
          onApply={() => applyFilters({ ...draft, page: 1 })}
          onReset={resetFilters}
          onClose={closeFilters}
          lockedCategorySlug={lockedCategorySlug}
          filterOptions={filterOptions}
        />

        <section className="mp-results" aria-label="Product results">
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
