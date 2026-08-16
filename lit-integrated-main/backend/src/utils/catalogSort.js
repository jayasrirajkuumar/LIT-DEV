const SORT_KEY_ALIASES = {
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  "name-asc": "name_asc",
  "name-desc": "name_desc",
};

export function normalizeSortKey(key) {
  if (!key) return "newest";
  return SORT_KEY_ALIASES[key] || key;
}

export const VALID_SORT_KEYS = [
  "newest",
  "price_asc",
  "price_desc",
  "popularity",
  "discount",
  "featured",
  "rating",
  "name_asc",
  "name_desc",
];
