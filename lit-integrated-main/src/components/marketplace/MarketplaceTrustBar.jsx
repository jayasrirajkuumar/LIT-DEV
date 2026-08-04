import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import "./MarketplaceLuxuryHome.css";

const TRUST_ITEMS = [
  { icon: Truck, label: "Free Premium Delivery" },
  { icon: BadgeCheck, label: "100% Authentic Products" },
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Headphones, label: "Premium Customer Support" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const MarketplaceTrustBar = () => (
  <section className="mp-trust-bar" aria-label="Trust indicators">
    <motion.div
      className="mp-trust-bar__grid"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <motion.article key={item.label} className="mp-trust-bar__card" variants={itemVariants} whileHover={{ y: -4 }}>
            <div className="mp-trust-bar__icon">
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <p>{item.label}</p>
          </motion.article>
        );
      })}
    </motion.div>
  </section>
);

export default MarketplaceTrustBar;
