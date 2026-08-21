import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const flashSaleBg = "/images/marketplace/flash-sale-burberry.png"; // Burberry jumping couple

const MarketplaceFlashSale = () => {
  // 2 days, 18 hours, 34 mins, 59 secs target countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 18,
    minutes: 34,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, "0");

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20" aria-label="Flash Sale Promotion">
      <PageContainer>
        <div className="w-full lux-flash-sale relative border border-[#1f1d1a] overflow-hidden">
          {/* Background Image */}
          <img
            src={flashSaleBg}
            alt="Burberry Swimwear Flash Sale"
            className="w-full h-full object-cover object-top sm:object-center absolute inset-0"
            loading="lazy"
          />

          {/* Gradient Overlay */}
          <div className="lux-flash-overlay absolute inset-0" />

          {/* Content Box (Right-aligned matching reference UI) */}
          <div className="lux-flash-content relative z-10 h-full flex items-center justify-end">
            <div className="lux-flash-copy w-full text-left">
              {/* Tag */}
              <p className="lux-flash-kicker">
                FLASH SALE
              </p>

              {/* Main Headline */}
              <h2 className="lux-flash-title lux-serif">
                Up to 60% Off
              </h2>

              {/* Subtitle */}
              <p className="lux-flash-subtitle">
                Limited time. Exceptional savings.
              </p>

              {/* Countdown Cards */}
              <div className="lux-countdown-row">
                <div className="lux-countdown-box">
                  <span className="block text-lg sm:text-2xl font-bold text-[#faf8f5]">
                    {formatNumber(timeLeft.days)}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] text-[#a09a8f] uppercase font-semibold mt-0.5">
                    DAYS
                  </span>
                </div>

                <div className="lux-countdown-box">
                  <span className="block text-lg sm:text-2xl font-bold text-[#faf8f5]">
                    {formatNumber(timeLeft.hours)}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] text-[#a09a8f] uppercase font-semibold mt-0.5">
                    HRS
                  </span>
                </div>

                <div className="lux-countdown-box">
                  <span className="block text-lg sm:text-2xl font-bold text-[#faf8f5]">
                    {formatNumber(timeLeft.minutes)}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] text-[#a09a8f] uppercase font-semibold mt-0.5">
                    MINS
                  </span>
                </div>

                <div className="lux-countdown-box">
                  <span className="block text-lg sm:text-2xl font-bold text-[#faf8f5]">
                    {formatNumber(timeLeft.seconds)}
                  </span>
                  <span className="block text-[9px] sm:text-[10px] tracking-[0.2em] text-[#a09a8f] uppercase font-semibold mt-0.5">
                    SECS
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="lux-flash-action">
                <Link
                  to="/shop/products?clearance=true"
                  className="lux-btn-primary lux-flash-button"
                >
                  SHOP THE SALE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceFlashSale;
