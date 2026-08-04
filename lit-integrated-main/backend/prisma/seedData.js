/**
 * Luxury marketplace seed data for LIT Phase 3.5
 * Idempotent upserts use category slug + product SKU as keys.
 */

export const SEED_CATEGORIES = [
  {
    slug: "luxury-watches",
    name: "Luxury Watches",
    description: "Swiss craftsmanship and haute horology for discerning collectors.",
    imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
    displayOrder: 1,
  },
  {
    slug: "luxury-perfumes",
    name: "Luxury Perfumes",
    description: "Iconic fragrances from the world's most celebrated maisons.",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
    displayOrder: 2,
  },
  {
    slug: "luxury-handbags",
    name: "Luxury Handbags",
    description: "Signature bags defined by heritage, leather, and timeless design.",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
    displayOrder: 3,
  },
  {
    slug: "luxury-shoes",
    name: "Luxury Shoes",
    description: "Designer footwear crafted for elegance and exceptional comfort.",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd1?w=800&q=80",
    displayOrder: 4,
  },
  {
    slug: "luxury-jewelry",
    name: "Luxury Jewelry",
    description: "Fine jewelry featuring precious metals, stones, and masterful settings.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    displayOrder: 5,
  },
  {
    slug: "luxury-clothing",
    name: "Luxury Clothing",
    description: "Runway-inspired apparel from leading fashion houses.",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-abda7b25d92d?w=800&q=80",
    displayOrder: 6,
  },
  {
    slug: "accessories",
    name: "Accessories",
    description: "Belts, scarves, eyewear, and finishing touches for refined style.",
    imageUrl: "https://images.unsplash.com/photo-1520903920243-00d749a2d375?w=800&q=80",
    displayOrder: 7,
  },
];

const PRODUCT_TEMPLATES = {
  "luxury-watches": [
    { brand: "Rolex", names: ["Submariner Date", "Daytona Cosmograph"], basePrice: 850000 },
    { brand: "Patek Philippe", names: ["Nautilus 5711", "Calatrava 5227"], basePrice: 4200000 },
    { brand: "Audemars Piguet", names: ["Royal Oak", "Royal Oak Offshore"], basePrice: 3100000 },
  ],
  "luxury-perfumes": [
    { brand: "Chanel", names: ["N°5 Eau de Parfum", "Coco Mademoiselle"], basePrice: 12500 },
    { brand: "Dior", names: ["Sauvage Elixir", "Miss Dior"], basePrice: 11800 },
    { brand: "Tom Ford", names: ["Black Orchid", "Oud Wood"], basePrice: 24500 },
  ],
  "luxury-handbags": [
    { brand: "Hermès", names: ["Birkin 30", "Kelly 28"], basePrice: 1450000 },
    { brand: "Louis Vuitton", names: ["Capucines BB", "Neverfull MM"], basePrice: 245000 },
    { brand: "Chanel", names: ["Classic Flap Medium", "Boy Bag"], basePrice: 680000 },
  ],
  "luxury-shoes": [
    { brand: "Christian Louboutin", names: ["Pigalle 120", "So Kate 120"], basePrice: 69500 },
    { brand: "Gucci", names: ["Horsebit Loafer", "Ace Sneaker"], basePrice: 82000 },
    { brand: "Prada", names: ["Monolith Boot", "Cloudbust Thunder"], basePrice: 95000 },
  ],
  "luxury-jewelry": [
    { brand: "Cartier", names: ["Love Bracelet", "Juste un Clou"], basePrice: 285000 },
    { brand: "Tiffany & Co.", names: ["T Wire Bracelet", "HardWear Link"], basePrice: 195000 },
    { brand: "Bulgari", names: ["Serpenti Viper", "B.zero1 Ring"], basePrice: 320000 },
  ],
  "luxury-clothing": [
    { brand: "Burberry", names: ["Heritage Trench", "Quilted Jacket"], basePrice: 185000 },
    { brand: "Valentino", names: ["Rockstud Blazer", "Pleated Midi Skirt"], basePrice: 210000 },
    { brand: "Saint Laurent", names: ["Le Smoking Jacket", "Silk Shirt"], basePrice: 165000 },
  ],
  accessories: [
    { brand: "Gucci", names: ["GG Marmont Belt", "Silk Web Scarf"], basePrice: 45000 },
    { brand: "Prada", names: ["Saffiano Wallet", "Re-Nylon Cap"], basePrice: 52000 },
    { brand: "Hermès", names: ["Cavalier Scarf 90", "H Belt Reversible"], basePrice: 78000 },
  ],
};

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildDescription(brand, name, categoryName) {
  return `${name} by ${brand} — an exceptional piece from our ${categoryName} collection. Crafted with premium materials and the meticulous attention to detail synonymous with luxury maisons. A statement of refined taste for the modern connoisseur.`;
}

function buildProductsForCategory(categorySlug, categoryName) {
  const templates = PRODUCT_TEMPLATES[categorySlug] || [];
  const products = [];
  let index = 0;

  templates.forEach((template) => {
    template.names.forEach((name) => {
      index += 1;
      const sku = `LIT-${categorySlug.toUpperCase().replace(/-/g, "").slice(0, 6)}-${String(index).padStart(3, "0")}`;
      const slug = slugify(`${brandPrefix(template.brand)}-${name}`);
      const price = Math.round(template.basePrice * (0.85 + (index % 5) * 0.05));
      const comparePrice = Math.round(price * (1.25 + (index % 3) * 0.15));
      const isFeatured = index % 4 === 0;
      const quantity = 8 + (index % 12);

      products.push({
        sku,
        slug,
        name,
        brand: template.brand,
        shortDescription: `${name} — ${template.brand} signature ${categoryName.toLowerCase()}.`,
        description: buildDescription(template.brand, name, categoryName),
        price,
        comparePrice,
        isFeatured,
        inventory: {
          quantity,
          reservedQuantity: index % 7 === 0 ? 1 : 0,
          lowStockThreshold: 5,
        },
        images: [
          {
            imageUrl: `https://picsum.photos/seed/${sku}-1/900/900`,
            altText: `${name} by ${template.brand}`,
            sortOrder: 0,
            isPrimary: true,
          },
          {
            imageUrl: `https://picsum.photos/seed/${sku}-2/900/900`,
            altText: `${name} alternate view`,
            sortOrder: 1,
            isPrimary: false,
          },
        ],
        weight: categorySlug === "luxury-watches" ? 0.18 : 0.65,
        dimensions: { length: 30, width: 22, height: 8, unit: "cm" },
      });
    });
  });

  return products;
}

function brandPrefix(brand) {
  return brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function buildSeedProducts() {
  return SEED_CATEGORIES.flatMap((category) =>
    buildProductsForCategory(category.slug, category.name).map((product) => ({
      ...product,
      categorySlug: category.slug,
      status: product.inventory.quantity > 0 ? "ACTIVE" : "OUT_OF_STOCK",
    })),
  );
}

export default {
  SEED_CATEGORIES,
  buildSeedProducts,
};
