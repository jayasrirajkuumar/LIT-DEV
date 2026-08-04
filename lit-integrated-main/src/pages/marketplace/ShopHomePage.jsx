import React from "react";

import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";

import MarketplaceLuxuryHero from "../../components/marketplace/MarketplaceLuxuryHero";

import MarketplaceTrustBar from "../../components/marketplace/MarketplaceTrustBar";

import MarketplaceLuxuryCategories from "../../components/marketplace/MarketplaceLuxuryCategories";

import MarketplaceFeaturedCollections from "../../components/marketplace/MarketplaceFeaturedCollections";

import MarketplaceBrandsSection from "../../components/marketplace/MarketplaceBrandsSection";

import MarketplaceFlashDeals from "../../components/marketplace/MarketplaceFlashDeals";

import MarketplaceWhyChoose from "../../components/marketplace/MarketplaceWhyChoose";

import MarketplaceTestimonials from "../../components/marketplace/MarketplaceTestimonials";

import MarketplaceLookbook from "../../components/marketplace/MarketplaceLookbook";

import EmptyState from "../../components/marketplace/EmptyState";

import ErrorState from "../../components/marketplace/ErrorState";

import ProductCarousel, { ProductCarouselSkeleton } from "../../components/marketplace/ProductCarousel";

import ProductGrid from "../../components/marketplace/ProductGrid";

import { useCatalogQuery } from "../../hooks/useCatalogQuery";

import { getFeaturedProducts, getNewArrivalProducts } from "../../services/catalogApiService";

import "../../components/marketplace/MarketplaceHome.css";

import "../../components/marketplace/MarketplaceLuxuryHome.css";



const ShopHomePage = () => {

  const newArrivalsQuery = useCatalogQuery("new-arrivals:9", () => getNewArrivalProducts(9));

  const trendingQuery = useCatalogQuery("featured:8", () => getFeaturedProducts(8));

  const products = newArrivalsQuery.data?.products || [];

  const trendingProducts = trendingQuery.data?.products || [];



  return (

    <MarketplaceLayout isHome>

      <div className="mp-luxury-home">

        <MarketplaceLuxuryHero />

        <MarketplaceTrustBar />

        <MarketplaceLuxuryCategories />

        <MarketplaceFeaturedCollections />



        {newArrivalsQuery.loading && <ProductCarouselSkeleton title="Fresh Arrivals" count={5} />}

        {!newArrivalsQuery.loading && newArrivalsQuery.error && (
          <ErrorState
            message={newArrivalsQuery.error.message}
            onRetry={newArrivalsQuery.refetch}
          />
        )}



        {!newArrivalsQuery.loading && !newArrivalsQuery.error && products.length > 0 && (

          <ProductCarousel

            products={products}

            title="Fresh Arrivals"

            className="mp-fresh-arrivals"

            viewAllTo="/shop/products"

          />

        )}



        {!newArrivalsQuery.loading && !newArrivalsQuery.error && products.length === 0 && (

          <EmptyState

            title="No products yet"

            message="Run the database seed to populate the luxury catalog."

          />

        )}



        {trendingQuery.loading && (

          <div className="mp-luxury-trending">

            <ProductCarouselSkeleton title="Trending Products" count={4} />

          </div>

        )}

        {!trendingQuery.loading && !trendingQuery.error && trendingProducts.length > 0 && (

          <div className="mp-luxury-trending">

            <ProductGrid

              products={trendingProducts}

              title="Trending Products"

              titleClassName="mp-section-title"

              variant="premium"

            />

          </div>

        )}



        <MarketplaceBrandsSection />

        <MarketplaceFlashDeals />

        <MarketplaceWhyChoose />

        <MarketplaceTestimonials />

        <MarketplaceLookbook />
      </div>

    </MarketplaceLayout>

  );

};



export default ShopHomePage;

