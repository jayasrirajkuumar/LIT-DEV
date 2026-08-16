import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Sparkles, Heart, Truck } from "lucide-react";
import "./MarketplaceLuxuryHome.css";

const TRUST_ITEMS = [
  {
    icon: BadgeCheck,
    label: "AUTHENTICATED",
    description: "Every piece verified for your peace of mind.",
  },
  {
    icon: Sparkles,
    label: "CURATED",
    description: "Handpicked pieces with intention.",
  },
  {
    icon: Heart,
    label: "FAMILY OWNED",
    description: "Purely in search of excellence.",
  },
  {
    icon: Truck,
    label: "SECURE DELIVERY",
    description: "From our hands to yours.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const MarketplaceTrustBar = () => (
  <section className="mp-trust-bar mp-trust-bar--editorial" aria-label="Trust indicators">
    <motion.div
      className="mp-trust-bar__grid mp-trust-bar__grid--four"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <motion.article key={item.label} className="mp-trust-bar__card mp-trust-bar__card--editorial" variants={itemVariants}>
            <div className="mp-trust-bar__icon">
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  </section>
);

export default MarketplaceTrustBar;
