import React from "react";
import { motion } from "framer-motion";
import BackNavigation from "../layout/BackNavigation";
import MarketplaceAnnouncementBar from "./MarketplaceAnnouncementBar";
import MarketplaceNavbar from "./MarketplaceNavbar";
import "../../styles/marketplace.css";

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const MarketplaceLayout = ({
  children,
  pageTitle,
  backLabel,
  backTo = "/shop",
  showMarketplaceNav = true,
  isHome = false,
}) => (
  <div className={`mp-page mp-page--luxury${isHome ? " mp-page--home" : ""}`}>
    {showMarketplaceNav && (
      <header className="mp-marketplace-header">
        <MarketplaceAnnouncementBar />
        <MarketplaceNavbar />
      </header>
    )}
    <motion.main
      className="mp-main"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {pageTitle && (
        <header className="mp-page-title-header">
          <h1>{pageTitle}</h1>
        </header>
      )}
      {backLabel && (
        <div className="mp-back-nav-wrap">
          <BackNavigation label={backLabel} fallbackTo={backTo} />
        </div>
      )}
      {children}
    </motion.main>
  </div>
);

export default MarketplaceLayout;
