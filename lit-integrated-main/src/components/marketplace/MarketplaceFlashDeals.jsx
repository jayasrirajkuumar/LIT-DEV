import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import handbagsImage from "../../assets/marketplace/flashcards/flashcard-handbags.png";
import watchesImage from "../../assets/marketplace/flashcards/flashcard-watches.png";
import shoesImage from "../../assets/marketplace/flashcards/flashcard-shoes.png";
import "./MarketplaceLuxuryHome.css";

const DEALS = [
  { id: "handbags", title: "Designer Handbags", discount: "40% OFF", image: handbagsImage, to: "/shop/category/luxury-handbags" },
  { id: "watches", title: "Luxury Watches", discount: "25% OFF", image: watchesImage, to: "/shop/category/luxury-watches" },
  { id: "shoes", title: "Premium Footwear", discount: "35% OFF", image: shoesImage, to: "/shop/category/luxury-shoes" },
];

const getEndOfWeek = () => {
  const end = new Date();
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7 || 7));
  end.setHours(23, 59, 59, 999);
  return end;
};

const pad = (value) => String(value).padStart(2, "0");

const MarketplaceFlashDeals = () => {
  const [target] = useState(() => getEndOfWeek());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <section className="mp-flash-deals" aria-label="Flash deals">
      <motion.div
        className="mp-flash-deals__inner"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mp-flash-deals__header">
          <div>
            <p className="mp-section-kicker">Limited Time</p>
            <h2 className="mp-section-heading">Flash Deals</h2>
            <p className="mp-flash-deals__subtitle">
              Exclusive offers on authenticated luxury — available while stocks last.
            </p>
          </div>

          <div className="mp-flash-deals__timer" aria-label="Deal countdown">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Min", value: timeLeft.minutes },
              { label: "Sec", value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="mp-flash-deals__timer-unit">
                <span>{pad(unit.value)}</span>
                <small>{unit.label}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-flash-deals__grid">
          {DEALS.map((deal, index) => (
            <motion.article
              key={deal.id}
              className="mp-flash-deals__card"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              <Link to={deal.to}>
                <div className="mp-flash-deals__card-media">
                  <img src={deal.image} alt={deal.title} loading="lazy" />
                  <span className="mp-flash-deals__chip">{deal.discount}</span>
                </div>
                <div className="mp-flash-deals__card-body">
                  <h3>{deal.title}</h3>
                  <span>Shop Now →</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="mp-flash-deals__cta-wrap">
          <Link to="/shop/products?discount=1" className="mp-lux-btn mp-lux-btn--primary">
            View All Deals
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default MarketplaceFlashDeals;
