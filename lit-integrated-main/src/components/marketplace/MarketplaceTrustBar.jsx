import React from "react";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

/* ─────────────────────────────────────────────────────────────────────────────
   EXACT SVG icons matching the user's reference upload
   Row 1 (gold): Shield with checkmark · Diamond · Price tag · Delivery truck
   Stroke color: #c5a059 (lux-gold), thin outlines ~1.4px — matches reference
   ───────────────────────────────────────────────────────────────────────────── */

const GoldShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Shield outline */}
    <path d="M24 4L6 12v14c0 11 7.5 17.5 18 20 10.5-2.5 18-9 18-20V12L24 4z" />
    {/* Checkmark */}
    <polyline points="16 24 22 30 33 18" />
  </svg>
);

const GoldDiamondIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Diamond / gem outline */}
    <polygon points="24 4 44 20 24 44 4 20" />
    <polyline points="4 20 14 20 24 4 34 20 44 20" />
    <line x1="14" y1="20" x2="24" y2="44" />
    <line x1="34" y1="20" x2="24" y2="44" />
  </svg>
);

const GoldTagIcon = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Price tag */}
    <path d="M8 8h16l18 18-16 16L8 24V8z" />
    <circle cx="17" cy="17" r="2.5" fill="#c5a059" stroke="none" />
  </svg>
);

const GoldTruckIcon = () => (
  <svg width="36" height="32" viewBox="0 0 56 40" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* Truck body */}
    <rect x="2" y="8" width="32" height="22" rx="2" />
    {/* Cab */}
    <path d="M34 14h10l6 8v8H34V14z" />
    {/* Wheels */}
    <circle cx="12" cy="32" r="4" />
    <circle cx="42" cy="32" r="4" />
  </svg>
);

const BENEFITS = [
  { id: "authenticated",   Icon: GoldShieldIcon,  title: "AUTHENTICATED",   desc: "Every piece verified for your peace of mind." },
  { id: "curated",         Icon: GoldDiamondIcon, title: "CURATED",         desc: "Handpicked pieces with intention." },
  { id: "fairly-priced",   Icon: GoldTagIcon,     title: "FAIRLY PRICED",   desc: "Luxury at considered prices." },
  { id: "secure-delivery", Icon: GoldTruckIcon,   title: "SECURE DELIVERY", desc: "From our hands to yours." },
];

const MarketplaceTrustBar = () => {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-[#000000]" aria-label="Why Shop With LIT">
      <PageContainer>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#1e1c19] border-y border-[#1e1c19] w-full">
          {BENEFITS.map(({ id, Icon, title, desc }) => (
            <div
              key={id}
              className="lux-trust-item flex items-center gap-5 px-6 sm:px-8 py-6 sm:py-8 lg:py-10 group transition-colors hover:bg-[#080706]"
            >
              {/* Gold icon */}
              <div className="shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Icon />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#faf8f5] mb-1.5">
                  {title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#9c9588] leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceTrustBar;
