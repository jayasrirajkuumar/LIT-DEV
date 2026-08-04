import { mapInventoryPublic } from "../utils/inventoryHelpers.js";

export function toPublicCategory(category, options = {}) {
  const { includeProductCount = false } = options;

  const base = {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: category.imageUrl,
    isActive: category.isActive,
    displayOrder: category.displayOrder,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };

  if (includeProductCount && category._count) {
    base.productCount = category._count.products;
  }

  return base;
}

export function toPublicProductImage(image) {
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    altText: image.altText,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
  };
}

export function toPublicProduct(product, options = {}) {
  const { includeDescription = true } = options;
  const inventory = mapInventoryPublic(product.inventory);

  const base = {
    id: product.id,
    categoryId: product.categoryId,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : undefined,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    sku: product.sku,
    brand: product.brand,
    price: product.price.toString(),
    comparePrice: product.comparePrice?.toString() ?? null,
    currency: product.currency,
    status: product.status,
    weight: product.weight?.toString() ?? null,
    dimensions: product.dimensions ?? null,
    isFeatured: product.isFeatured,
    stockQuantity: inventory.quantity,
    inventory,
    images: (product.images ?? []).map(toPublicProductImage),
    primaryImage:
      product.images?.find((img) => img.isPrimary)?.imageUrl ??
      product.images?.[0]?.imageUrl ??
      null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  if (includeDescription) {
    base.description = product.description;
  }

  return base;
}

export default {
  toPublicCategory,
  toPublicProduct,
  toPublicProductImage,
};
