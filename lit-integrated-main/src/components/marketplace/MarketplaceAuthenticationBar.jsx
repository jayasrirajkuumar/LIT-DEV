import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, SearchCheck, FileCheck } from "lucide-react";
import "./MarketplaceLuxuryHome.css";

const ITEMS = [
  {
    icon: ShieldCheck,
    label: "VERIFIED",
    description: "Every piece authenticated by our experts.",
  },
  {
    icon: SearchCheck,
    label: "INSPECTED",
    description: "Quality checked before it reaches you.",
  },
  {
    icon: FileCheck,
    label: "DOCUMENTED",
    description: "Full provenance and certification included.",
  },
];

const MarketplaceAuthenticationBar = () => (
  <section className="mp-auth-bar" aria-label="Authentication promise">
    <div className="mp-auth-bar__inner">
      <div className="mp-auth-bar__intro">
        <p className="mp-auth-bar__tagline">Because luxury should come with certainty.</p>
      </div>

      <div className="mp-auth-bar__items">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="mp-auth-bar__item">
              <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <strong>{item.label}</strong>
                <p>{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <Link to="/shop/products" className="mp-auth-bar__cta">
        OUR AUTHENTICATION PROCESS
      </Link>
    </div>
  </section>
);

export default MarketplaceAuthenticationBar;
