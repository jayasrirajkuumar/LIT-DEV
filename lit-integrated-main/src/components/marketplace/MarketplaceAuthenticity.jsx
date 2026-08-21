import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const GoldShieldCheck = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 4L6 12v14c0 11 7.5 17.5 18 20 10.5-2.5 18-9 18-20V12L24 4z" />
    <polyline points="16 24 22 30 33 18" />
  </svg>
);

const GoldSearchGlass = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="20" cy="20" r="12" />
    <line x1="29" y1="29" x2="42" y2="42" />
  </svg>
);

const GoldDocumentCheck = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" stroke="#c5a059" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="8" width="28" height="34" rx="3" />
    <path d="M18 4h12v6H18z" />
    <line x1="17" y1="18" x2="31" y2="18" />
    <line x1="17" y1="24" x2="25" y2="24" />
    <circle cx="31" cy="31" r="5" fill="#070605" stroke="#c5a059" strokeWidth="1.8" />
    <polyline points="29 31 31 33 34 29" stroke="#c5a059" strokeWidth="1.6" />
  </svg>
);

const AUTH_POINTS = [
  {
    id: "verified",
    Icon: GoldShieldCheck,
    title: "VERIFIED",
    desc: "Every product undergoes rigorous authentication.",
  },
  {
    id: "inspected",
    Icon: GoldSearchGlass,
    title: "INSPECTED",
    desc: "Detailed checks for quality and condition.",
  },
  {
    id: "documented",
    Icon: GoldDocumentCheck,
    title: "DOCUMENTED",
    desc: "Product condition recorded before dispatch.",
  },
];

const MarketplaceAuthenticity = () => {
  return (
    <section className="lux-authenticity-wrap w-full py-14 sm:py-18 lg:py-24" aria-label="Authenticity Assured">
      <PageContainer>
        <div className="w-full bg-[#070605] border-y border-[#181614] py-12 sm:py-16 px-4 sm:px-8 lg:px-12 space-y-10 lg:space-y-12">
          {/* Centered Heading */}
          <div className="text-center space-y-3">
            <h2 className="lux-section-heading">
              AUTHENTICITY, ASSURED.
            </h2>
            <p className="text-xs sm:text-sm text-[#a09a8f] font-light tracking-wide">
              Because luxury should come with certainty.
            </p>
          </div>

          {/* 3 Columns + 1 Action Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center w-full">
            {AUTH_POINTS.map(({ id, Icon, title, desc }) => (
              <div
                key={id}
                className="flex items-center gap-5 p-3 group"
              >
                <div className="shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Icon />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#faf8f5] mb-1.5">
                    {title}
                  </h3>
                  <p className="text-xs text-[#8c8579] leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}

            {/* 4th Box: Our Authentication Process CTA */}
            <div className="p-2">
              <Link
                to="/authentication"
                className="lux-auth-box-cta group block w-full py-4 px-6 text-center border border-[#2e2a24] hover:border-[#c5a059] transition-all duration-300"
              >
                <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#faf8f5] group-hover:text-[#d8b87a] inline-flex items-center justify-center gap-2">
                  OUR AUTHENTICATION PROCESS →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceAuthenticity;
