/** Client fallback when /api/gift-cards/config is unreachable (backend offline). */
export const FALLBACK_GIFT_CARD_CONFIG = {
  enabled: true,
  minAmount: 100,
  maxAmount: 50000,
  expiryMonths: 12,
  platformFeePercent: 0,
  gstPercent: 18,
  presetAmounts: [250, 500, 1000, 2000, 5000, 10000],
  templates: [
    { slug: "luxury-black", name: "Luxury Black", gradient: "linear-gradient(135deg,#0a0a0a,#1a1a2e,#4c1d9544)" },
    { slug: "purple-neon", name: "Purple Neon", gradient: "linear-gradient(135deg,#12081f,#5b21b6,#7c3aed55)" },
    { slug: "golden-elite", name: "Golden Elite", gradient: "linear-gradient(135deg,#141008,#92650a,#b8860b33)" },
    { slug: "cyber-blue", name: "Cyber Blue", gradient: "linear-gradient(135deg,#020617,#1e3a5f,#4338ca44)" },
    { slug: "minimal-white", name: "Minimal White", gradient: "linear-gradient(135deg,#18181b,#27272a,#52525b)" },
    { slug: "gaming-theme", name: "Gaming Theme", gradient: "linear-gradient(135deg,#0f0f23,#6b21a8,#581c8744)" },
    { slug: "fashion-theme", name: "Fashion Theme", gradient: "linear-gradient(135deg,#18181b,#831843,#9d174d44)" },
    { slug: "birthday-theme", name: "Birthday Theme", gradient: "linear-gradient(135deg,#1e1b4b,#92400e,#78350f44)" },
    { slug: "festival-theme", name: "Festival Theme", gradient: "linear-gradient(135deg,#2a0a0a,#991b1b,#7f1d1d44)" },
    { slug: "anniversary-theme", name: "Anniversary Theme", gradient: "linear-gradient(135deg,#1a0a2e,#831843,#701a7544)" },
  ],
};

export function calculateGiftCardPricing(amount, config, couponDiscount = 0) {
  const baseAmount = Number(amount);
  const platformFee = (baseAmount * Number(config.platformFeePercent || 0)) / 100;
  const taxable = Math.max(0, baseAmount - couponDiscount);
  const gstAmount = (taxable * Number(config.gstPercent || 18)) / 100;
  const grandTotal = Math.max(0, taxable + platformFee + gstAmount);

  return {
    amount: baseAmount,
    platformFee,
    gstAmount,
    discountAmount: couponDiscount,
    grandTotal,
  };
}
