import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBgImage from "../../assets/marketplace-hero-bg.png";
import "./MarketplaceLuxuryHome.css";

const getEndOfWeek = () => {
  const end = new Date();
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7 || 7));
  end.setHours(23, 59, 59, 999);
  return end;
};

const pad = (value) => String(value).padStart(2, "0");

const MarketplaceFlashSaleBanner = () => {
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
    <section className="mp-flash-sale-banner" aria-label="Flash sale">
      <motion.div
        className="mp-flash-sale-banner__inner"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={heroBgImage} alt="" className="mp-flash-sale-banner__bg" loading="lazy" />
        <div className="mp-flash-sale-banner__scrim" aria-hidden="true" />

        <div className="mp-flash-sale-banner__content">
          <p className="mp-flash-sale-banner__kicker">Flash Sale</p>
          <h2 className="mp-flash-sale-banner__title">Up to 60% Off</h2>
          <p className="mp-flash-sale-banner__sub">Limited time. Exceptional savings.</p>

          <div className="mp-flash-sale-banner__timer" aria-label="Sale countdown">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((unit) => (
              <div key={unit.label} className="mp-flash-sale-banner__timer-unit">
                <span>{pad(unit.value)}</span>
                <small>{unit.label}</small>
              </div>
            ))}
          </div>

          <Link to="/shop/products?discount=1" className="mp-flash-sale-banner__btn">
            SHOP THE SALE
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default MarketplaceFlashSaleBanner;
