/** Client fallback when /api/marketplace/config is unreachable or DB is offline. */
export const FALLBACK_MARKETPLACE_CONFIG = {
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

export const EMPTY_PRODUCT_LIST = { products: [], total: 0, page: 1, totalPages: 0 };

export function isCatalogDegradedError(error) {
  const message = String(error?.message ?? "");
  return (
    error?.code === "network_error" ||
    error?.code === "NETWORK_ERROR" ||
    error?.code === "DATABASE_UNAVAILABLE" ||
    error?.status === 503 ||
    error?.name === "TypeError" ||
    message.includes("Failed to fetch") ||
    message.includes("temporarily unavailable") ||
    message.includes("Database unavailable") ||
    message.includes("Unable to reach")
  );
}
