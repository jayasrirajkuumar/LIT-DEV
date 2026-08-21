import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const FOOTER_SECTIONS = [
  {
    title: "SHOP",
    links: [
      { label: "Men", to: "/shop/products?gender=men" },
      { label: "Women", to: "/shop/products?gender=women" },
      { label: "Kids", to: "/shop/products?kids=true" },
      { label: "New Arrivals", to: "/shop/products?sort=newest" },
      { label: "Bestsellers", to: "/shop/products?sort=best-selling" },
      { label: "Clearance", to: "/shop/products?clearance=true" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "FAQs", to: "/support" },
      { label: "Shipping & Delivery", to: "/support" },
      { label: "Returns & Exchanges", to: "/returnpolicy" },
      { label: "Track Order", to: "/orders" },
    ],
  },
  {
    title: "ABOUT",
    links: [
      { label: "About LIT", to: "/about" },
      { label: "Our Authentication", to: "/authentication" },
      { label: "The LIT Story", to: "/about" },
      { label: "Careers", to: "/about" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Refund Policy", to: "/returnpolicy" },
    ],
  },
  {
    title: "EXTRAS",
    links: [
      { label: "Journal", to: "/journal" },
      { label: "LIT Points", to: "/profile" },
      { label: "Gift Cards", to: "/gift-cards" },
    ],
  },
];

const MarketplaceLuxuryFooter = () => {
  return (
    <footer className="lux-footer w-full pb-12 sm:pb-16 lg:pb-20" aria-label="Footer">
      <PageContainer>
        <div className="w-full border-t border-[#1a1815] pt-16 sm:pt-20 lg:pt-24">
          {/* Main Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 pb-14 border-b border-[#1c1a17]">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Link to="/shop" className="inline-flex items-center gap-2 group">
              <span className="lux-serif text-2xl font-bold tracking-[0.18em] text-[#faf8f5] group-hover:text-[#d8b87a] transition-colors">
                LIT
              </span>
              <span className="text-[8px] font-semibold tracking-[0.22em] uppercase text-[#8c8579] leading-tight">
                LUXURY<br />IN TASTE
              </span>
            </Link>
            <p className="text-xs text-[#8c8579] leading-relaxed">
              Curated differently. Authenticated with precision. Defining modern luxury across India.
            </p>
          </div>

          {/* Links Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="lux-footer-col-title">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="lux-footer-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6e685f]">
          <p>© {new Date().getFullYear()} LIT. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-[#8c857a] hover:text-[#d8b87a] cursor-pointer transition-colors">
              <span>INDIA (INR ₹)</span>
              <span className="text-[10px]">▼</span>
            </span>
          </div>
        </div>
        </div>
      </PageContainer>
    </footer>
  );
};

export default MarketplaceLuxuryFooter;
