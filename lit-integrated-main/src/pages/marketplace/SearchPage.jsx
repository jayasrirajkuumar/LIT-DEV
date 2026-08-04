import React from "react";
import { useSearchParams } from "react-router-dom";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import EmptyState from "../../components/marketplace/EmptyState";
import { searchProducts } from "../../services/catalogApiService";
import ProductListingView from "./ProductListingView";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return (
      <MarketplaceLayout initialQuery="" backLabel="Back to Marketplace" backTo="/shop">
        <EmptyState
          title="Start searching"
          message="Use the search bar above to find luxury products across the catalog."
        />
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout initialQuery={query} pageTitle={`Results for "${query}"`} backLabel="Back to Marketplace" backTo="/shop">
      <ProductListingView
        sectionTitle={`Results for "${query}"`}
        fetchProducts={(params) => searchProducts({ ...params, q: query })}
        emptyTitle="No results found"
        emptyMessage={`We couldn't find products matching "${query}". Try another keyword.`}
      />
    </MarketplaceLayout>
  );
};

export default SearchPage;
