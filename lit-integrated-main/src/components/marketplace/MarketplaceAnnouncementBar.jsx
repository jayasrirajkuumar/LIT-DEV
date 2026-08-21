import React from "react";
import { ShieldCheck } from "lucide-react";
import "../../styles/marketplace-luxury.css";

const MarketplaceAnnouncementBar = () => {
  return (
    <div className="w-full select-none">
      {/* 1. Top Announcement Bar */}
      <div className="lux-top-announcement px-4">
        <p className="m-0 text-center truncate">
          AUTHENTIC LUXURY. CURATED DIFFERENTLY. UP TO 60% OFF.
        </p>
      </div>

      {/* 2. Secured Payments Strip */}
      <div className="lux-secured-strip px-4">
        <div className="flex items-center justify-center gap-1.5 opacity-90">
          <ShieldCheck size={12} strokeWidth={2} className="text-[#a09a8f]" aria-hidden="true" />
          <span className="font-semibold">SECURED PAYMENTS</span>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceAnnouncementBar;
