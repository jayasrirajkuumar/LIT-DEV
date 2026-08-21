import React from "react";
import { Link } from "react-router-dom";
import { DISCOVER_MORE_CARDS } from "../../data/marketplace/luxuryData";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceDiscoverMore = () => {
  return (
    <section className="lux-discover-section w-full py-14 sm:py-18 lg:py-24" aria-label="Discover More">
      <PageContainer>
        <div className="lux-discover-content w-full">
          {/* Header */}
          <div className="lux-discover-header flex items-center justify-between border-b border-[#1c1b18] pb-4">
            <h2 className="lux-serif text-xl sm:text-2xl lg:text-3xl text-[#faf8f5] font-normal tracking-[0.12em] uppercase">
              DISCOVER MORE
            </h2>

            <Link
              to="/shop/products"
              className="lux-link-arrow text-xs text-[#a09a8f] hover:text-[#d8b87a] tracking-[0.18em]"
            >
              VIEW ALL EDITS →
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="lux-discover-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
            {DISCOVER_MORE_CARDS.map((card) => (
              <Link
                key={card.id}
                to={card.link}
                className="lux-discover-card block relative border border-[#1f1d1a] overflow-hidden group select-none"
              >
                {/* Background Photo */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover object-center absolute inset-0"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="lux-discover-overlay absolute inset-0 transition-opacity duration-500 group-hover:opacity-85" />

                {/* Content Box (Lower left) */}
                <div className="lux-discover-copy absolute inset-x-0 bottom-0 p-6 sm:p-7 z-10">
                  <h3 className="lux-serif text-2xl sm:text-3xl text-[#faf8f5] font-normal tracking-wide drop-shadow-sm">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#c2bcaf] font-light">
                    {card.desc}
                  </p>
                  <div className="pt-2">
                    <span className="lux-link-arrow text-xs text-[#ece7df] group-hover:text-[#d8b87a]">
                      {card.cta}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceDiscoverMore;
