import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { LUXURY_PRODUCTS } from "../../data/marketplace/luxuryData";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceProductCarousel = () => {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full py-14 sm:py-18 lg:py-24" aria-label="Shop The Edit">
      <PageContainer>
        <div className="space-y-6 w-full">
          {/* Section Header with Left Title and Right VIEW ALL → */}
          <div className="flex items-center justify-between border-b border-[#1c1b18] pb-4">
            <h2 className="lux-serif text-xl sm:text-2xl lg:text-3xl text-[#faf8f5] font-normal tracking-[0.12em] uppercase">
              SHOP THE EDIT
            </h2>

            <div className="flex items-center gap-4">
              <Link
                to="/shop/products"
                className="lux-link-arrow text-xs text-[#a09a8f] hover:text-[#d8b87a] tracking-[0.18em]"
              >
                VIEW ALL →
              </Link>

              {/* Desktop Navigation Arrows */}
              <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-[#24221e]">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  className="w-8 h-8 rounded-full border border-[#262420] text-[#a09a8f] hover:text-[#faf8f5] hover:border-[#c5a059] flex items-center justify-center transition-colors"
                  aria-label="Previous products"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  className="w-8 h-8 rounded-full border border-[#262420] text-[#a09a8f] hover:text-[#faf8f5] hover:border-[#c5a059] flex items-center justify-center transition-colors"
                  aria-label="Next products"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Carousel Track */}
          <div
            ref={scrollRef}
            className="lux-carousel-track"
          >
            {LUXURY_PRODUCTS.map((product) => (
              <div key={product.id} className="lux-carousel-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceProductCarousel;
