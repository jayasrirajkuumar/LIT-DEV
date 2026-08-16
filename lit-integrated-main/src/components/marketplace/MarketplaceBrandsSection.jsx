import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMarketplaceConfig } from "../../services/marketplaceApiService";
import "./MarketplaceHome.css";
import "./MarketplaceLuxuryHome.css";

const LUXURY_BRANDS = [
  { id: "prada", name: "PRADA", slug: "prada" },
  { id: "gucci", name: "GUCCI", slug: "gucci" },
  { id: "burberry", name: "BURBERRY", slug: "burberry" },
  { id: "ferragamo", name: "FERRAGAMO", slug: "ferragamo" },
  { id: "boss", name: "BOSS", slug: "boss" },
  { id: "valentino", name: "VALENTINO", slug: "valentino" },
  { id: "ysl", name: "SAINT LAURENT", slug: "saint-laurent" },
];

const MarketplaceBrandsSection = () => {
  const [brands, setBrands] = useState(LUXURY_BRANDS);

  useEffect(() => {
    fetchMarketplaceConfig()
      .then((data) => {
        const loaded = data.brands ?? [];
        if (loaded.length) {
          const merged = LUXURY_BRANDS.map((brand) => {
            const match = loaded.find(
              (item) => item.name?.toLowerCase() === brand.name.toLowerCase()
                || item.slug === brand.slug,
            );
            return match ? { ...brand, ...match, name: brand.name } : brand;
          });
          setBrands(merged);
        }
      })
      .catch(() => setBrands(LUXURY_BRANDS));
  }, []);

  if (!brands.length) return null;

  return (
    <section className="mp-maison-brands" id="brands" aria-label="Luxury brands">
      <div className="mp-luxury-section-header">
        <p className="mp-section-kicker">Maisons</p>
        <h2 className="mp-section-heading mp-section-heading--serif">The Maison Edit</h2>
        <span className="mp-luxury-section-title__line" aria-hidden="true" />
      </div>

      <div className="mp-maison-brands__row">
        {brands.map((brand) => (
          <Link
            key={brand.id || brand.slug}
            to={`/shop/products?brand=${encodeURIComponent(brand.name)}`}
            className="mp-maison-brands__logo"
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} loading="lazy" />
            ) : (
              <span>{brand.name}</span>
            )}
          </Link>
        ))}
      </div>

      <div className="mp-maison-brands__footer">
        <Link to="/shop/products">VIEW ALL BRANDS</Link>
      </div>
    </section>
  );
};

export default MarketplaceBrandsSection;
