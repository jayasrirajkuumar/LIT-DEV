import React from "react";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";

const GiftCardsPage = () => (
  <MarketplaceLayout pageTitle="Gift Cards" backLabel="Back to Marketplace" backTo="/shop">
    <section className="mp-gift-cards">
      <p className="mp-gift-cards__lead">
        Give the gift of luxury. Digital gift cards for the LIT Marketplace are coming soon.
      </p>
      <div className="mp-gift-cards__card">
        <h2>Premium Gift Cards</h2>
        <p>
          Purchase curated gift cards redeemable across men&apos;s, women&apos;s, and kids collections.
          Admin-managed denominations will be available in a future release.
        </p>
      </div>
    </section>
  </MarketplaceLayout>
);

export default GiftCardsPage;
