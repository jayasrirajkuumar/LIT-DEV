const SORT_KEY_ALIASES = {
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  "name-asc": "name_asc",
  "name-desc": "name_desc",
  "a-z": "name_asc",
  "z-a": "name_desc",
};

export function normalizeSortKey(key) {
  if (!key) return "newest";
  return SORT_KEY_ALIASES[key] || key;
}

export const DEFAULT_SORT_OPTIONS = [
  { key: "newest", label: "Newest" },
  { key: "popularity", label: "Popularity" },
  { key: "price_asc", label: "Price Low to High" },
  { key: "price_desc", label: "Price High to Low" },
  { key: "discount", label: "Discount" },
  { key: "featured", label: "Featured" },
];
