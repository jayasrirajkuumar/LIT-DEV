import React from "react";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import MarketplaceFooter from "../../components/marketplace/MarketplaceFooter";
import MarketplaceCategoryHero from "../../components/marketplace/MarketplaceCategoryHero";
import MarketplaceTrustBar from "../../components/marketplace/MarketplaceTrustBar";
import MarketplaceFlashSaleBanner from "../../components/marketplace/MarketplaceFlashSaleBanner";
import MarketplaceShopByCategory from "../../components/marketplace/MarketplaceShopByCategory";
import MarketplaceBrandsSection from "../../components/marketplace/MarketplaceBrandsSection";
import MarketplaceLookbook from "../../components/marketplace/MarketplaceLookbook";
import MarketplaceAuthenticationBar from "../../components/marketplace/MarketplaceAuthenticationBar";
import EmptyState from "../../components/marketplace/EmptyState";
import ErrorState from "../../components/marketplace/ErrorState";
import ProductCarousel, { ProductCarouselSkeleton } from "../../components/marketplace/ProductCarousel";
import { useCatalogQuery } from "../../hooks/useCatalogQuery";
import { getFeaturedProducts } from "../../services/catalogApiService";
import "../../components/marketplace/MarketplaceHome.css";
import "../../components/marketplace/MarketplaceLuxuryHome.css";

const ShopHomePage = () => {
  const shopEditQuery = useCatalogQuery("featured:12", () => getFeaturedProducts(12));
  const products = shopEditQuery.data?.products || [];

  return (
    <>
      <MarketplaceLayout isHome>
        <div className="mp-luxury-home mp-luxury-home--editorial">
          <MarketplaceCategoryHero />
          <MarketplaceTrustBar />
          <MarketplaceFlashSaleBanner />
          <MarketplaceShopByCategory />
          <MarketplaceBrandsSection />

          {shopEditQuery.loading && <ProductCarouselSkeleton title="Shop The Edit" count={5} />}
          {!shopEditQuery.loading && shopEditQuery.error && (
            <ErrorState message={shopEditQuery.error.message} onRetry={shopEditQuery.refetch} />
          )}
          {!shopEditQuery.loading && !shopEditQuery.error && products.length > 0 && (
            <ProductCarousel
              products={products}
              title="Shop The Edit"
              className="mp-shop-the-edit"
              viewAllTo="/shop/products"
              viewAllLabel="VIEW ALL →"
            />
          )}
          {!shopEditQuery.loading && !shopEditQuery.error && products.length === 0 && (
            <EmptyState
              title="No products yet"
              message="Run the database seed to populate the luxury catalog."
            />
          )}

          <MarketplaceLookbook />
          <MarketplaceAuthenticationBar />
        </div>
      </MarketplaceLayout>
      <MarketplaceFooter />
    </>
  );
};

export default ShopHomePage;
