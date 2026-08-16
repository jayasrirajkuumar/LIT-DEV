/**
 * LIT luxury marketplace seed — editorial home + full catalog.
 * Idempotent upserts use category slug + product SKU as keys.
 */

const IMG = {
  watch: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=85",
  watch2: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=900&q=85",
  perfume: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=85",
  perfume2: "https://images.unsplash.com/photo-1594035910537-467c8025a2a8?w=900&q=85",
  bag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=85",
  bag2: "https://images.unsplash.com/photo-1590874103328-eacfd5662742?w=900&q=85",
  loafer: "https://images.unsplash.com/photo-1533867612538-9b90291d9120?w=900&q=85",
  heel: "https://images.unsplash.com/photo-1543163521-1bf539c55dd1?w=900&q=85",
  sneaker: "https://images.unsplash.com/photo-1606107557195-0a42c7c3d2e8?w=900&q=85",
  jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=85",
  bracelet: "https://images.unsplash.com/photo-1611591437281-460bf849aaef?w=900&q=85",
  coat: "https://images.unsplash.com/photo-1490481651871-abda7b25d92d?w=900&q=85",
  blazer: "https://images.unsplash.com/photo-1594938298605-cd64d7194e8b?w=900&q=85",
  scarf: "https://images.unsplash.com/photo-1601924994987-69fb7708bf26?w=900&q=85",
  sunglasses: "https://images.unsplash.com/photo-1572635196233-4f6923fe4d95?w=900&q=85",
  belt: "https://images.unsplash.com/photo-1624224642624-9f090a85f2a6?w=900&q=85",
  wallet: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&q=85",
};

export const SEED_CATEGORIES = [
  {
    slug: "luxury-handbags",
    name: "Bags",
    description: "Signature bags defined by heritage, leather, and timeless design.",
    imageUrl: IMG.bag,
    displayOrder: 1,
  },
  {
    slug: "luxury-shoes",
    name: "Shoes",
    description: "Designer footwear crafted for elegance and exceptional comfort.",
    imageUrl: IMG.heel,
    displayOrder: 2,
  },
  {
    slug: "luxury-clothing",
    name: "Clothing",
    description: "Runway-inspired apparel from leading fashion houses.",
    imageUrl: IMG.coat,
    displayOrder: 3,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Belts, scarves, eyewear, and finishing touches for refined style.",
    imageUrl: IMG.sunglasses,
    displayOrder: 4,
  },
  {
    slug: "luxury-watches",
    name: "Watches",
    description: "Swiss craftsmanship and haute horology for discerning collectors.",
    imageUrl: IMG.watch,
    displayOrder: 5,
  },
  {
    slug: "luxury-jewelry",
    name: "Jewelry",
    description: "Fine jewelry featuring precious metals, stones, and masterful settings.",
    imageUrl: IMG.jewelry,
    displayOrder: 6,
  },
  {
    slug: "luxury-perfumes",
    name: "Perfumes",
    description: "Iconic fragrances from the world's most celebrated maisons.",
    imageUrl: IMG.perfume,
    displayOrder: 7,
  },
];

/** Featured "Shop The Edit" products — match editorial home mockup */
const SHOP_EDIT_PRODUCTS = [
  {
    sku: "LIT-PRADA-BAG-001",
    slug: "prada-re-nylon-shoulder-bag",
    name: "Re-Nylon Shoulder Bag",
    brand: "Prada",
    categorySlug: "luxury-handbags",
    price: 32350,
    comparePrice: 54000,
    isFeatured: true,
    imageUrl: IMG.bag,
    imageUrl2: IMG.bag2,
  },
  {
    sku: "LIT-GUCCI-SHOE-001",
    slug: "gucci-horsebit-loafer",
    name: "Horsebit Loafer",
    brand: "Gucci",
    categorySlug: "luxury-shoes",
    price: 58800,
    comparePrice: 98000,
    isFeatured: true,
    imageUrl: IMG.loafer,
    imageUrl2: IMG.sneaker,
  },
  {
    sku: "LIT-YSL-ACC-001",
    slug: "saint-laurent-sl-217-new-wave",
    name: "SL 217 New Wave",
    brand: "Saint Laurent",
    categorySlug: "accessories",
    price: 29750,
    comparePrice: 42500,
    isFeatured: true,
    imageUrl: IMG.sunglasses,
    imageUrl2: IMG.sunglasses,
  },
  {
    sku: "LIT-BOSS-WATCH-001",
    slug: "boss-chronograph-watch",
    name: "Chronograph Watch",
    brand: "Boss",
    categorySlug: "luxury-watches",
    price: 44550,
    comparePrice: 134000,
    isFeatured: true,
    imageUrl: IMG.watch,
    imageUrl2: IMG.watch2,
  },
  {
    sku: "LIT-BURB-ACC-001",
    slug: "burberry-vintage-check-scarf",
    name: "Vintage Check Scarf",
    brand: "Burberry",
    categorySlug: "accessories",
    price: 19600,
    comparePrice: 28000,
    isFeatured: true,
    imageUrl: IMG.scarf,
    imageUrl2: IMG.scarf,
  },
  {
    sku: "LIT-FERR-SHOE-001",
    slug: "ferragamo-viva-bow-pump",
    name: "Viva Bow Pump",
    brand: "Ferragamo",
    categorySlug: "luxury-shoes",
    price: 45600,
    comparePrice: 76000,
    isFeatured: true,
    imageUrl: IMG.heel,
    imageUrl2: IMG.heel,
  },
  {
    sku: "LIT-VAL-SHOE-001",
    slug: "valentino-rockstud-pump",
    name: "Rockstud Pump",
    brand: "Valentino",
    categorySlug: "luxury-shoes",
    price: 53400,
    comparePrice: 89000,
    isFeatured: true,
    imageUrl: IMG.heel,
    imageUrl2: IMG.sneaker,
  },
  {
    sku: "LIT-PRADA-ACC-001",
    slug: "prada-saffiano-wallet",
    name: "Saffiano Wallet",
    brand: "Prada",
    categorySlug: "accessories",
    price: 28500,
    comparePrice: 42000,
    isFeatured: true,
    imageUrl: IMG.wallet,
    imageUrl2: IMG.belt,
  },
];

const CATALOG_PRODUCTS = [
  { sku: "LIT-GUCCI-BAG-001", slug: "gucci-gg-marmont-mini", name: "GG Marmont Mini", brand: "Gucci", categorySlug: "luxury-handbags", price: 98500, comparePrice: 142000, imageUrl: IMG.bag2 },
  { sku: "LIT-BURB-BAG-001", slug: "burberry-tb-bag", name: "TB Bag Medium", brand: "Burberry", categorySlug: "luxury-handbags", price: 87500, comparePrice: 125000, imageUrl: IMG.bag },
  { sku: "LIT-VAL-BAG-001", slug: "valentino-loco-shoulder-bag", name: "Locò Shoulder Bag", brand: "Valentino", categorySlug: "luxury-handbags", price: 112000, comparePrice: 168000, imageUrl: IMG.bag2 },
  { sku: "LIT-PRADA-SHOE-001", slug: "prada-americas-cup-sneaker", name: "Americas Cup Sneaker", brand: "Prada", categorySlug: "luxury-shoes", price: 72000, comparePrice: 95000, imageUrl: IMG.sneaker },
  { sku: "LIT-BURB-SHOE-001", slug: "burberry-check-sneaker", name: "Check Sneaker", brand: "Burberry", categorySlug: "luxury-shoes", price: 65000, comparePrice: 88000, imageUrl: IMG.sneaker },
  { sku: "LIT-YSL-SHOE-001", slug: "saint-laurent-opyum-sandal", name: "Opyum Sandal", brand: "Saint Laurent", categorySlug: "luxury-shoes", price: 82000, comparePrice: 115000, imageUrl: IMG.heel },
  { sku: "LIT-BURB-CLO-001", slug: "burberry-heritage-trench", name: "Heritage Trench Coat", brand: "Burberry", categorySlug: "luxury-clothing", price: 185000, comparePrice: 245000, imageUrl: IMG.coat },
  { sku: "LIT-VAL-CLO-001", slug: "valentino-rockstud-blazer", name: "Rockstud Blazer", brand: "Valentino", categorySlug: "luxury-clothing", price: 210000, comparePrice: 285000, imageUrl: IMG.blazer },
  { sku: "LIT-YSL-CLO-001", slug: "saint-laurent-le-smoking-jacket", name: "Le Smoking Jacket", brand: "Saint Laurent", categorySlug: "luxury-clothing", price: 165000, comparePrice: 220000, imageUrl: IMG.blazer },
  { sku: "LIT-BOSS-CLO-001", slug: "boss-tailored-suit", name: "Tailored Suit", brand: "Boss", categorySlug: "luxury-clothing", price: 145000, comparePrice: 195000, imageUrl: IMG.coat },
  { sku: "LIT-GUCCI-ACC-001", slug: "gucci-gg-marmont-belt", name: "GG Marmont Belt", brand: "Gucci", categorySlug: "accessories", price: 45000, comparePrice: 62000, imageUrl: IMG.belt },
  { sku: "LIT-FERR-ACC-001", slug: "ferragamo-gancini-belt", name: "Gancini Belt", brand: "Ferragamo", categorySlug: "accessories", price: 38000, comparePrice: 52000, imageUrl: IMG.belt },
  { sku: "LIT-BOSS-WATCH-002", slug: "boss-automatic-watch", name: "Automatic Watch", brand: "Boss", categorySlug: "luxury-watches", price: 68500, comparePrice: 98000, imageUrl: IMG.watch2 },
  { sku: "LIT-GUCCI-WATCH-001", slug: "gucci-g-timeless-watch", name: "G-Timeless Watch", brand: "Gucci", categorySlug: "luxury-watches", price: 92000, comparePrice: 128000, imageUrl: IMG.watch },
  { sku: "LIT-VAL-JEW-001", slug: "valentino-rockstud-bracelet", name: "Rockstud Bracelet", brand: "Valentino", categorySlug: "luxury-jewelry", price: 95000, comparePrice: 135000, imageUrl: IMG.bracelet },
  { sku: "LIT-PRADA-JEW-001", slug: "prada-symbole-necklace", name: "Symbole Necklace", brand: "Prada", categorySlug: "luxury-jewelry", price: 78000, comparePrice: 110000, imageUrl: IMG.jewelry },
  { sku: "LIT-GUCCI-PERF-001", slug: "gucci-bloom-edp", name: "Bloom Eau de Parfum", brand: "Gucci", categorySlug: "luxury-perfumes", price: 12500, comparePrice: 15800, imageUrl: IMG.perfume },
  { sku: "LIT-BURB-PERF-001", slug: "burberry-her-edp", name: "Her Eau de Parfum", brand: "Burberry", categorySlug: "luxury-perfumes", price: 9800, comparePrice: 13200, imageUrl: IMG.perfume2 },
  { sku: "LIT-VAL-PERF-001", slug: "valentino-donna-born-in-roma", name: "Donna Born in Roma", brand: "Valentino", categorySlug: "luxury-perfumes", price: 11800, comparePrice: 14500, imageUrl: IMG.perfume },
  { sku: "LIT-YSL-PERF-001", slug: "saint-laurent-libre-edp", name: "Libre Eau de Parfum", brand: "Saint Laurent", categorySlug: "luxury-perfumes", price: 13200, comparePrice: 16800, imageUrl: IMG.perfume2 },
];

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDescription(brand, name, categoryName) {
  return `${name} by ${brand} — an exceptional piece from our ${categoryName} collection. Every item is authenticated, inspected, and documented before dispatch. Crafted with premium materials and the meticulous attention to detail synonymous with luxury maisons.`;
}

function toSeedProduct(raw, categoryName) {
  const quantity = raw.quantity ?? 12;
  const imageUrl = raw.imageUrl || IMG.bag;
  const imageUrl2 = raw.imageUrl2 || imageUrl;

  return {
    sku: raw.sku,
    slug: raw.slug || slugify(`${raw.brand}-${raw.name}`),
    name: raw.name,
    brand: raw.brand,
    shortDescription: `${raw.name} — ${raw.brand} signature ${categoryName.toLowerCase()}.`,
    description: buildDescription(raw.brand, raw.name, categoryName),
    price: raw.price,
    comparePrice: raw.comparePrice,
    isFeatured: raw.isFeatured ?? false,
    inventory: {
      quantity,
      reservedQuantity: 0,
      lowStockThreshold: 5,
    },
    images: [
      {
        imageUrl,
        altText: `${raw.name} by ${raw.brand}`,
        sortOrder: 0,
        isPrimary: true,
      },
      {
        imageUrl: imageUrl2,
        altText: `${raw.name} alternate view`,
        sortOrder: 1,
        isPrimary: false,
      },
    ],
    weight: raw.categorySlug === "luxury-watches" ? 0.18 : 0.65,
    dimensions: { length: 30, width: 22, height: 8, unit: "cm" },
    categorySlug: raw.categorySlug,
    status: quantity > 0 ? "ACTIVE" : "OUT_OF_STOCK",
  };
}

export function buildSeedProducts() {
  const categoryBySlug = Object.fromEntries(SEED_CATEGORIES.map((c) => [c.slug, c.name]));

  const featured = SHOP_EDIT_PRODUCTS.map((p) =>
    toSeedProduct(p, categoryBySlug[p.categorySlug]),
  );

  const catalog = CATALOG_PRODUCTS.map((p) =>
    toSeedProduct({ ...p, isFeatured: p.isFeatured ?? false }, categoryBySlug[p.categorySlug]),
  );

  return [...featured, ...catalog];
}

export default {
  SEED_CATEGORIES,
  SHOP_EDIT_PRODUCTS,
  buildSeedProducts,
};
