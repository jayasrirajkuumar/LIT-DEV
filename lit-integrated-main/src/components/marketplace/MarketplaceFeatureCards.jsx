import React from "react";
import { motion } from "framer-motion";
import { Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import "./MarketplaceHome.css";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary delivery on orders above ₹2,999 across India.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Bank-grade encryption and trusted payment partners.",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Hassle-free returns within our luxury return window.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated concierge assistance whenever you need it.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const MarketplaceFeatureCards = () => (
  <section className="mp-features-section" aria-label="Shopping benefits">
    <div className="mp-section-header mp-section-header--center">
      <p className="mp-section-kicker">The LIT Promise</p>
      <h2 className="mp-section-heading">Delivery Across India</h2>
      <p className="mp-section-subtitle">Premium service designed for the modern luxury shopper.</p>
    </div>

    <div className="mp-features-grid">
      {FEATURES.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.article
            key={feature.title}
            className="mp-feature-card"
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={cardVariants}
            whileHover={{ y: -6 }}
          >
            <div className="mp-feature-card__icon">
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.article>
        );
      })}
    </div>
  </section>
);

export default MarketplaceFeatureCards;
