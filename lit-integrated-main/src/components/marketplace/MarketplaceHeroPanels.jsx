import React from "react";
import { Link } from "react-router-dom";
import { LUXURY_HERO_PANELS } from "../../data/marketplace/luxuryData";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceHeroPanels = () => {
  return (
    <section className="w-full pt-4 pb-12 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20" aria-label="Hero Categories">
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full">
          {LUXURY_HERO_PANELS.map((panel) => (
            <Link
              key={panel.id}
              to={panel.link}
              className="lux-hero-panel group block relative border border-[#1f1d1a] overflow-hidden select-none"
            >
              {/* Background Photography — absolute fill */}
              <img
                src={panel.image}
                alt={`${panel.title} Luxury Collection`}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="eager"
                fetchPriority="high"
              />

              {/* Subtle Gradient Overlay */}
              <div className="lux-hero-overlay absolute inset-0 transition-opacity duration-500 group-hover:opacity-90" />

              {/* Lower Text Content */}
              <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-4 sm:left-6 lg:left-8 z-10 space-y-1.5 sm:space-y-2">
                <h2 className="lux-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#faf8f5] font-normal tracking-[0.04em] drop-shadow-md">
                  {panel.title}
                </h2>
                <span className="lux-link-arrow text-xs sm:text-sm text-[#ece7df] group-hover:text-[#d8b87a] inline-block pt-0.5">
                  {panel.ctaText}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceHeroPanels;
