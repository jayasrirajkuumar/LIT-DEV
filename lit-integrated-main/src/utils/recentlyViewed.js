const STORAGE_KEY = "lit_recently_viewed";
const MAX_ITEMS = 8;

export function trackRecentlyViewed(product) {
  if (!product?.id) return;

  const entry = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    currency: product.currency,
    primaryImage: product.primaryImage || product.images?.[0]?.imageUrl || null,
    viewedAt: Date.now(),
  };

  const existing = getRecentlyViewed().filter((item) => item.id !== product.id);
  const next = [entry, ...existing].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default { trackRecentlyViewed, getRecentlyViewed };
