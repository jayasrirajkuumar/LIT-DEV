export const MARKETPLACE_CONFIG_FALLBACK = {
  announcements: [],
  brands: [],
  sortOptions: [
    { id: "newest", key: "newest", label: "Newest", isActive: true },
    { id: "popularity", key: "popularity", label: "Popularity", isActive: true },
    { id: "price-asc", key: "price_asc", label: "Price Low to High", isActive: true },
    { id: "price-desc", key: "price_desc", label: "Price High to Low", isActive: true },
    { id: "discount", key: "discount", label: "Discount", isActive: true },
    { id: "featured", key: "featured", label: "Featured", isActive: true },
  ],
  filterOptions: [],
};

export const PRODUCT_LIST_FALLBACK = {
  products: [],
  total: 0,
  page: 1,
  totalPages: 0,
};

export const CATEGORIES_FALLBACK = {
  categories: [],
};

export const GIFT_CARD_CONFIG_FALLBACK = {
  config: {
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
    ],
  },
};
