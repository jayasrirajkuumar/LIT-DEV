import React from "react";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import { getProducts } from "../../services/catalogApiService";
import ProductListingView from "./ProductListingView";

const CatalogListingPage = () => (
  <MarketplaceLayout pageTitle="All Products" backLabel="Back to Marketplace" backTo="/shop">
    <ProductListingView
      fetchProducts={getProducts}
      sectionTitle="All Products"
      emptyTitle="No products match your filters"
      emptyMessage="Try clearing filters or exploring a category from the shop home."
    />
  </MarketplaceLayout>
);

export default CatalogListingPage;
