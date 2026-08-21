import React from "react";
import { Link } from "react-router-dom";
import { CATEGORY_SPLIT_DATA } from "../../data/marketplace/luxuryData";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceCategorySplit = () => {
  return (
    <section className="w-full py-14 sm:py-18 lg:py-24" aria-label="Shop By Category">
      <PageContainer>
        <div className="space-y-6 md:space-y-8 w-full">
          {/* Section Heading */}
          <div className="lux-category-heading-wrap mb-4 md:mb-6">
            <h2 className="lux-section-heading lux-category-heading">
              SHOP BY CATEGORY
            </h2>
          </div>

          {/* 2 Columns: MEN & WOMEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[5px] w-full">
            {/* MEN Column */}
            <div className="lux-category-card relative border border-[#1f1d1a] overflow-hidden group">
              <img
                src={CATEGORY_SPLIT_DATA.men.image}
                alt="Men Luxury Fashion"
                className="w-full h-full object-cover object-center absolute inset-0"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

              {/* Left Content */}
              <div className="lux-category-copy lux-category-copy--men relative z-10 h-full p-8 sm:p-12 lg:p-14 flex flex-col justify-center max-w-xs space-y-4">
                <h3 className="lux-serif text-3xl sm:text-4xl lg:text-5xl text-[#faf8f5] font-normal tracking-wide">
                  {CATEGORY_SPLIT_DATA.men.title}
                </h3>

                <ul className="space-y-2.5 pt-1">
                  {CATEGORY_SPLIT_DATA.men.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="lux-category-link text-xs sm:text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="pt-3">
                  <Link
                    to={CATEGORY_SPLIT_DATA.men.exploreLink}
                    className="lux-link-arrow text-xs !text-[#d8b87a] hover:!text-[#faf8f5]"
                  >
                    EXPLORE ALL →
                  </Link>
                </div>
              </div>
            </div>

            {/* WOMEN Column */}
            <div className="lux-category-card relative border border-[#1f1d1a] overflow-hidden group">
              <img
                src={CATEGORY_SPLIT_DATA.women.image}
                alt="Women Luxury Fashion"
                className="w-full h-full object-cover object-center absolute inset-0"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/40 to-transparent" />

              {/* Right-aligned Content on Desktop for Women panel matching reference */}
              <div className="lux-category-copy lux-category-copy--women relative z-10 h-full p-8 sm:p-12 lg:p-14 flex flex-col justify-center ml-auto max-w-xs space-y-4 text-left md:text-right">
                <h3 className="lux-serif text-3xl sm:text-4xl lg:text-5xl text-[#faf8f5] font-normal tracking-wide">
                  {CATEGORY_SPLIT_DATA.women.title}
                </h3>

                <ul className="space-y-2.5 pt-1">
                  {CATEGORY_SPLIT_DATA.women.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="lux-category-link text-xs sm:text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 flex justify-start md:justify-end">
                  <Link
                    to={CATEGORY_SPLIT_DATA.women.exploreLink}
                    className="lux-link-arrow text-xs !text-[#d8b87a] hover:!text-[#faf8f5]"
                  >
                    EXPLORE ALL →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceCategorySplit;
