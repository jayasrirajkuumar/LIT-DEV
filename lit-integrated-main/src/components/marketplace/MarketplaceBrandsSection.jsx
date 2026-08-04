import React, { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { fetchMarketplaceConfig } from "../../services/marketplaceApiService";

import "./MarketplaceHome.css";

import "./MarketplaceLuxuryHome.css";



const EXTENDED_BRANDS = [

  { id: "nike", name: "Nike", slug: "nike" },

  { id: "adidas", name: "Adidas", slug: "adidas" },

  { id: "puma", name: "Puma", slug: "puma" },

  { id: "levis", name: "Levi's", slug: "levis" },

  { id: "tommy", name: "Tommy Hilfiger", slug: "tommy-hilfiger" },

  { id: "calvin", name: "Calvin Klein", slug: "calvin-klein" },

  { id: "lv", name: "Louis Vuitton", slug: "louis-vuitton" },

  { id: "gucci", name: "Gucci", slug: "gucci" },

  { id: "rolex", name: "Rolex", slug: "rolex" },

  { id: "dior", name: "Dior", slug: "dior" },

  { id: "prada", name: "Prada", slug: "prada" },

  { id: "hm", name: "H&M", slug: "hm" },

  { id: "zara", name: "Zara", slug: "zara" },

  { id: "rayban", name: "Ray-Ban", slug: "ray-ban" },

  { id: "fossil", name: "Fossil", slug: "fossil" },

  { id: "coach", name: "Coach", slug: "coach" },

  { id: "mk", name: "Michael Kors", slug: "michael-kors" },

  { id: "moschino", name: "Moschino", slug: "moschino" },

  { id: "tory", name: "Tory Burch", slug: "tory-burch" },

  { id: "miumiu", name: "Miu Miu", slug: "miu-miu" },

  { id: "chloe", name: "Chloé", slug: "chloe" },

];



const MarketplaceBrandsSection = () => {

  const [brands, setBrands] = useState(EXTENDED_BRANDS);



  useEffect(() => {

    fetchMarketplaceConfig()

      .then((data) => {

        const loaded = data.brands ?? [];

        if (loaded.length) {

          const merged = [...loaded];

          EXTENDED_BRANDS.forEach((brand) => {

            if (!merged.some((item) => item.name?.toLowerCase() === brand.name.toLowerCase())) {

              merged.push(brand);

            }

          });

          setBrands(merged);

        }

      })

      .catch(() => setBrands(EXTENDED_BRANDS));

  }, []);



  if (!brands.length) return null;



  const marqueeBrands = [...brands, ...brands];



  return (

    <section className="mp-template-brands" id="brands" aria-label="Shop by brand">

      <div className="mp-template-brands__shell">

        <div className="mp-template-brands__glow" aria-hidden="true" />

        <div className="mp-luxury-section-header">

          <p className="mp-section-kicker">Maisons</p>

          <h2 className="mp-section-heading">Shop By Brands</h2>

          <span className="mp-luxury-section-title__line" aria-hidden="true" />

        </div>



        <div className="mp-brands-marquee">

          <div className="mp-brands-marquee__track">

            {marqueeBrands.map((brand, index) => (

              <Link

                key={`${brand.id || brand.slug || brand.name}-${index}`}

                to={`/shop/products?brand=${encodeURIComponent(brand.name)}`}

                className="mp-template-brand-card"

              >

                {brand.logoUrl ? (

                  <img src={brand.logoUrl} alt={brand.name} loading="lazy" />

                ) : (

                  <span className="mp-template-brand-card__name">{brand.name}</span>

                )}

              </Link>

            ))}

          </div>

        </div>

      </div>

    </section>

  );

};



export default MarketplaceBrandsSection;

