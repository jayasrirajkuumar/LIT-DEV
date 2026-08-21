import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

/* ─────────────────────────────────────────────────────────────────────────────
   Brand names rendered as pure TYPOGRAPHY — matching the reference screenshot
   exactly (PRADA bold, GUCCI spaced, BURBERRY bold, etc.)
   ───────────────────────────────────────────────────────────────────────────── */
const BRANDS = [
  { name: "PRADA",         slug: "prada",         className: "font-bold tracking-[0.22em] text-lg sm:text-xl" },
  { name: "GUCCI",         slug: "gucci",         className: "font-light tracking-[0.4em] text-lg sm:text-xl" },
  { name: "BURBERRY",      slug: "burberry",      className: "font-bold tracking-[0.12em] text-base sm:text-lg" },
  { name: "FERRAGAMO",     slug: "ferragamo",     className: "font-bold tracking-[0.08em] text-base sm:text-lg" },
  {
    name: "BOSS",
    slug: "boss",
    className: "font-black tracking-[0.06em] text-xl sm:text-2xl leading-none",
    sub: "HUGO BOSS",
  },
  { name: "VALENTINO",     slug: "valentino",     className: "font-light tracking-[0.18em] text-base sm:text-lg" },
  { name: "SAINT LAURENT", slug: "saint-laurent", className: "font-bold tracking-[0.06em] text-sm sm:text-base" },
];

const MarketplaceMaisonEdit = () => {
  return (
    <section className="w-full py-14 sm:py-18 lg:py-24" aria-label="The Maison Edit">
      <PageContainer>
        <div className="lux-maison-content text-center w-full">
          {/* Section Heading */}
          <div className="mb-4 md:mb-6">
            <h2 className="lux-section-heading">THE MAISON EDIT</h2>
          </div>

          {/* Brands — typography only, matching reference */}
          <div className="lux-maison-brands">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                to={`/shop/products?brand=${brand.slug}`}
                aria-label={brand.name}
                className="group flex flex-col items-center lux-brand-text-item"
              >
                <span
                  className={`${brand.className} font-sans text-[#e8e2d8] group-hover:text-[#ffffff] transition-all duration-300 tracking-widest`}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {brand.name}
                </span>
                {brand.sub && (
                  <span className="text-[7px] tracking-[0.3em] font-semibold text-[#9c9588] group-hover:text-[#c5a059] transition-colors mt-0.5">
                    {brand.sub}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* View All Brands */}
          <div className="lux-maison-view-all">
            <Link
              to="/designers"
              className="lux-link-arrow text-xs text-[#a09a8f] hover:text-[#d8b87a] tracking-[0.2em]"
            >
              VIEW ALL BRANDS →
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceMaisonEdit;
