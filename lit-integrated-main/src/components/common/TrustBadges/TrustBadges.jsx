import React from "react";

const TrustBadges = () => {
  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-sm text-slate-600 sm:grid-cols-3">
      <div className="min-w-0 rounded-lg px-2 py-1.5">✓ Secure Checkout</div>
      <div className="min-w-0 rounded-lg px-2 py-1.5">✓ Easy Returns</div>
      <div className="min-w-0 rounded-lg px-2 py-1.5">✓ Free Shipping over ₹500</div>
    </div>
  );
};

export default TrustBadges;
