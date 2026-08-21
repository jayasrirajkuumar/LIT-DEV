import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS_DATA } from "../../data/marketplace/luxuryData";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceTestimonials = () => {
  const [idx, setIdx] = useState(0);

  const prev = () => {
    setIdx((curr) => (curr === 0 ? TESTIMONIALS_DATA.length - 1 : curr - 1));
  };

  const next = () => {
    setIdx((curr) => (curr === TESTIMONIALS_DATA.length - 1 ? 0 : curr + 1));
  };

  const testimonial = TESTIMONIALS_DATA[idx];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20" aria-label="Customer Testimonials">
      <PageContainer>
        <div className="w-full border-t border-[#181715] pt-12 sm:pt-16">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 text-center space-y-8 sm:space-y-10">
          {/* Heading */}
          <div className="space-y-3">
            <h2 className="lux-section-heading">
              LOVED BY THOSE WHO KNOW LUXURY.
            </h2>
            <p className="text-xs sm:text-sm text-[#a09a8f] tracking-[0.2em] uppercase">
              5,000+ verified buyers across India
            </p>
          </div>

          {/* 5 Stars */}
          <div className="flex items-center justify-center gap-1.5 text-[#c5a059]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} fill="currentColor" />
            ))}
          </div>

          {/* Quote Content */}
          <div className="max-w-3xl mx-auto min-h-[140px] flex flex-col justify-center space-y-6">
            <p className="lux-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#faf8f5] italic font-light leading-relaxed">
              "{testimonial.quote}"
            </p>
            <p className="text-xs sm:text-sm font-bold tracking-[0.28em] uppercase text-[#d8b87a] pt-2">
              — {testimonial.author}, {testimonial.location}
            </p>
          </div>

          {/* Navigation Dots & Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={prev}
              className="w-8 h-8 rounded-full border border-[#262420] text-[#a09a8f] hover:text-[#faf8f5] hover:border-[#c5a059] flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              {TESTIMONIALS_DATA.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    i === idx ? "bg-[#c5a059] w-5" : "bg-[#2b2824]"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="w-8 h-8 rounded-full border border-[#262420] text-[#a09a8f] hover:text-[#faf8f5] hover:border-[#c5a059] flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceTestimonials;
