import React from "react";
import MarketplaceLayout from "../marketplace/MarketplaceLayout";
import MarketplaceFooter from "../marketplace/MarketplaceFooter";
import "../../styles/gift-cards.css";

const GiftCardsLayout = ({ children, hideFooter = false }) => (
  <>
    <MarketplaceLayout isHome showMarketplaceNav>
      <div className="gc-page">{children}</div>
    </MarketplaceLayout>
    {!hideFooter && <MarketplaceFooter />}
  </>
);

export default GiftCardsLayout;
