/**
 * Maps admin product form state ↔ catalog API payloads.
 */

function slugifyName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSku(name) {
  const base = String(name || "PROD")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  return `LIT-${base || "ITEM"}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export function mapApiProductToForm(product) {
  if (!product) return null;

  const price = Number(product.price ?? 0);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  let discountPercentage = "";
  if (comparePrice && comparePrice > price) {
    discountPercentage = Math.round(((comparePrice - price) / comparePrice) * 100);
  }

  return {
    productName: product.name || "",
    sku: product.sku || "",
    brand: product.brand || "",
    categoryId: product.categoryId || product.category?.id || "",
    originalPrice: price || "",
    discountPercentage,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    stock: product.stockQuantity ?? product.inventory?.quantity ?? 0,
    status: product.status || "DRAFT",
    isFeatured: Boolean(product.isFeatured),
    imageEntries: (product.images ?? []).map((img, index) => ({
      imageUrl: img.imageUrl || "",
      altText: img.altText || product.name || "",
      isPrimary: img.isPrimary ?? index === 0,
      sortOrder: img.sortOrder ?? index,
    })),
  };
}

export function mapFormToApiProduct(formData) {
  const name = String(formData.productName || formData.name || "").trim();
  const price = Number(formData.originalPrice ?? formData.price);
  const discount = Number(formData.discountPercentage || 0);
  let comparePrice = null;

  if (discount > 0 && discount < 100 && price > 0) {
    comparePrice = Number((price / (1 - discount / 100)).toFixed(2));
  }

  const images = (formData.imageEntries || [])
    .filter((entry) => entry.imageUrl?.trim())
    .map((entry, index) => ({
      imageUrl: entry.imageUrl.trim(),
      altText: entry.altText?.trim() || name,
      sortOrder: entry.sortOrder ?? index,
      isPrimary: Boolean(entry.isPrimary),
    }));

  if (images.length > 0 && !images.some((img) => img.isPrimary)) {
    images[0].isPrimary = true;
  }

  return {
    categoryId: formData.categoryId,
    name,
    sku: String(formData.sku || generateSku(name)).trim(),
    brand: String(formData.brand || formData.productLine || "LIT").trim(),
    price,
    comparePrice,
    currency: "INR",
    shortDescription: formData.shortDescription?.trim() || null,
    description: String(formData.description || "").trim() || null,
    status: formData.status || "DRAFT",
    isFeatured: Boolean(formData.isFeatured ?? formData.featured),
    inventory: {
      quantity: Number(formData.stock ?? 0),
      lowStockThreshold: Number(formData.lowStockThreshold ?? 5),
    },
    images,
  };
}

export { slugifyName, generateSku };
