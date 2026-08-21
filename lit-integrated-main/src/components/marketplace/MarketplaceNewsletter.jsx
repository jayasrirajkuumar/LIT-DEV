import React, { useState } from "react";
import PageContainer from "./PageContainer";
import "../../styles/marketplace-luxury.css";

const MarketplaceNewsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    window.dispatchEvent(
      new CustomEvent("lit-toast", {
        detail: { message: "Welcome to the inner circle of LIT luxury." },
      })
    );
  };

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20" aria-label="Newsletter Subscription">
      <PageContainer>
        <div className="w-full border-t border-[#1a1815] pt-12 sm:pt-16">
          <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <h2 className="lux-section-heading">
                STAY IN THE KNOW
              </h2>
              <p className="text-xs sm:text-sm text-[#a09a8f] font-light max-w-lg mx-auto leading-relaxed">
                Get early access to authenticated new arrivals, exclusive private sales, and seasonal maison edits.
              </p>
            </div>

            {subscribed ? (
              <div className="p-4 bg-[#0d0c0a] border border-[#2b2823] text-xs font-semibold tracking-wider text-[#d8b87a] max-w-md mx-auto">
                THANK YOU FOR SUBSCRIBING
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-[#12110f] border border-[#282622] text-xs text-[#faf8f5] px-4 py-3.5 outline-none focus:border-[#c5a059] transition-colors placeholder-[#666057]"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className="lux-btn-primary py-3.5 px-6 text-xs whitespace-nowrap"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default MarketplaceNewsletter;
