import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import MarketplaceLayout from "../../components/marketplace/MarketplaceLayout";
import MarketplaceHeroPanels from "../../components/marketplace/MarketplaceHeroPanels";
import MarketplaceTrustBar from "../../components/marketplace/MarketplaceTrustBar";
import MarketplaceFlashSale from "../../components/marketplace/MarketplaceFlashSale";
import MarketplaceCategorySplit from "../../components/marketplace/MarketplaceCategorySplit";
import MarketplaceMaisonEdit from "../../components/marketplace/MarketplaceMaisonEdit";
import MarketplaceProductCarousel from "../../components/marketplace/MarketplaceProductCarousel";
import MarketplaceDiscoverMore from "../../components/marketplace/MarketplaceDiscoverMore";
import MarketplaceAuthenticity from "../../components/marketplace/MarketplaceAuthenticity";
import "../../styles/marketplace-luxury.css";

const MotionDiv = motion.div;

const ShopHomePage = () => {
  const reduceMotion = useReducedMotion();
  const reveal = {
    initial: reduceMotion ? false : { opacity: 0, y: 42 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <MarketplaceLayout isHome showMarketplaceNav showFooter>
      <div className="lux-marketplace-content">
        <MotionDiv {...reveal}><MarketplaceHeroPanels /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceTrustBar /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceFlashSale /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceCategorySplit /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceMaisonEdit /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceProductCarousel /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceDiscoverMore /></MotionDiv>
        <MotionDiv {...reveal}><MarketplaceAuthenticity /></MotionDiv>
      </div>
    </MarketplaceLayout>
  );
};

export default ShopHomePage;
