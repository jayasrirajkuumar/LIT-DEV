import React from "react";
import { motion } from "framer-motion";
import BackNavigation from "../layout/BackNavigation";
import MarketplaceNavbar from "./MarketplaceNavbar";
import MarketplaceLuxuryFooter from "./MarketplaceLuxuryFooter";
import { LuxuryShoppingProvider } from "../../context/LuxuryShoppingContext";
import "../../styles/marketplace-luxury.css";

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const MarketplaceLayout = ({
  children,
  pageTitle,
  backLabel,
  backTo = "/shop",
  showMarketplaceNav = true,
  showFooter = true,
  isHome = false,
}) => (
  <LuxuryShoppingProvider>
    <div className={`lux-marketplace min-h-screen w-full flex flex-col ${isHome ? "lux-marketplace--home" : ""}`}>
      {showMarketplaceNav && (
        <header className="w-full sticky top-0 z-50">
          <MarketplaceNavbar />
        </header>
      )}

      <motion.main
        className="flex-1 w-full"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {pageTitle && (
          <header className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6 border-b border-[#1c1a17]">
            <h1 className="lux-serif text-2xl sm:text-3xl lg:text-4xl text-[#faf8f5] tracking-wide">
              {pageTitle}
            </h1>
          </header>
        )}

        {backLabel && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
            <BackNavigation label={backLabel} fallbackTo={backTo} />
          </div>
        )}

        {children}
      </motion.main>

      {showFooter && <MarketplaceLuxuryFooter />}
    </div>
  </LuxuryShoppingProvider>
);

export default MarketplaceLayout;
