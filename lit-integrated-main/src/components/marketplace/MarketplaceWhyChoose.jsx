import React from "react";

import { motion } from "framer-motion";

import { BadgeCheck, Gem, Lock, Package, Percent, Zap } from "lucide-react";

import "./MarketplaceLuxuryHome.css";



const REASONS = [

  {

    icon: Gem,

    title: "Curated Luxury Products",

    description: "Every piece is hand-selected for quality, provenance and timeless appeal.",

  },

  {

    icon: BadgeCheck,

    title: "Verified Brands",

    description: "Authenticated luxury from trusted partners and official maisons.",

  },

  {

    icon: Zap,

    title: "Fast Delivery",

    description: "Express fulfillment with premium handling across India.",

  },

  {

    icon: Lock,

    title: "Secure Checkout",

    description: "Protected payments with a seamless, discreet luxury experience.",

  },

  {

    icon: Package,

    title: "Premium Packaging",

    description: "Unboxing worthy of the brands we represent — refined to the last detail.",

  },

  {

    icon: Percent,

    title: "Exclusive Discounts",

    description: "Members-only offers and private sale access for LIT insiders.",

  },

];



const MarketplaceWhyChoose = () => (

  <section className="mp-why-section" aria-label="Why shop with LIT">

    <div className="mp-luxury-section-header">

      <p className="mp-section-kicker">The LIT Promise</p>

      <h2 className="mp-section-heading">Why Shop With LIT</h2>

      <span className="mp-luxury-section-title__line" aria-hidden="true" />

    </div>



    <div className="mp-why-grid">

      {REASONS.map((item, index) => {

        const Icon = item.icon;

        return (

          <motion.article

            key={item.title}

            className="mp-why-card"

            initial={{ opacity: 0, y: 24 }}

            whileInView={{ opacity: 1, y: 0 }}

            viewport={{ once: true, margin: "-40px" }}

            transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}

            whileHover={{ y: -4 }}

          >

            <div className="mp-why-card__glow" aria-hidden="true" />

            <div className="mp-why-card__icon">

              <Icon size={22} strokeWidth={1.5} />

            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

          </motion.article>

        );

      })}

    </div>

  </section>

);



export default MarketplaceWhyChoose;

