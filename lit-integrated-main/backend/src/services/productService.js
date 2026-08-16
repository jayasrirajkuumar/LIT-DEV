import { AppError } from "../utils/AppError.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { normalizeSortKey } from "../utils/catalogSort.js";
import slugify from "../utils/slugify.js";
import { isInStock } from "../utils/inventoryHelpers.js";

function mapListFilters(query) {
  const sort = normalizeSortKey(query.sort);
  return {
    page: query.page,
    limit: query.limit,
    categorySlug: query.category,
    brand: query.brand,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    availability: query.availability,
    sort,
    isFeatured:
      query.featured === "true" || query.featured === true ? true : undefined,
    status: "ACTIVE",
  };
}

function resolveProductStatus(status, inventory) {
  if (status === "ARCHIVED" || status === "DRAFT") {
    return status;
  }

  if (!isInStock(inventory)) {
    return "OUT_OF_STOCK";
  }

  return status === "OUT_OF_STOCK" ? "ACTIVE" : status;
}

export async function listProducts(query) {
  return productRepository.findMany(mapListFilters(query));
}

export async function searchProducts(query) {
  return productRepository.findMany({
    ...mapListFilters(query),
    search: query.q,
  });
}

export async function getFeaturedProducts(limit) {
  return productRepository.findMany({
    page: 1,
    limit,
    isFeatured: true,
    status: "ACTIVE",
    sort: "popularity",
  });
}

export async function getNewArrivals(limit) {
  return productRepository.findMany({
    page: 1,
    limit,
    status: "ACTIVE",
    sort: "newest",
  });
}

export async function getProductsByCategorySlug(categorySlug, query) {
  const category = await categoryRepository.findBySlug(categorySlug, { activeOnly: true });

  if (!category) {
    throw new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  const result = await productRepository.findMany({
    ...mapListFilters(query),
    categorySlug,
  });

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    ...result,
  };
}

export async function getProductBySlug(slug) {
  const product = await productRepository.findBySlug(slug, { publicOnly: true });

  if (!product) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  await productRepository.incrementViewCount(product.id);
  return product;
}

export async function createProduct(data) {
  const category = await categoryRepository.findById(data.categoryId);

  if (!category) {
    throw new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  const slug = data.slug || slugify(data.name);
  const [existingSlug, existingSku] = await Promise.all([
    productRepository.findBySlugExact(slug),
    productRepository.findBySku(data.sku),
  ]);

  if (existingSlug) {
    throw new AppError("Product slug already exists.", 409, "SLUG_ALREADY_EXISTS");
  }

  if (existingSku) {
    throw new AppError("Product SKU already exists.", 409, "SKU_ALREADY_EXISTS");
  }

  const status = resolveProductStatus(data.status ?? "DRAFT", {
    quantity: data.inventory?.quantity ?? 0,
    reservedQuantity: data.inventory?.reservedQuantity ?? 0,
    lowStockThreshold: data.inventory?.lowStockThreshold ?? 5,
  });

  return productRepository.create({
    categoryId: data.categoryId,
    name: data.name,
    slug,
    shortDescription: data.shortDescription ?? null,
    description: data.description ?? null,
    sku: data.sku,
    brand: data.brand,
    price: data.price,
    comparePrice: data.comparePrice ?? null,
    currency: data.currency ?? "INR",
    status,
    weight: data.weight ?? null,
    dimensions: data.dimensions ?? null,
    isFeatured: data.isFeatured ?? false,
    inventory: data.inventory ?? {},
    images: data.images ?? [],
  });
}

export async function updateProduct(id, data) {
  const existing = await productRepository.findById(id, { includeAllStatuses: true });

  if (!existing) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  if (data.slug && data.slug !== existing.slug) {
    const slugOwner = await productRepository.findBySlugExact(data.slug);
    if (slugOwner) {
      throw new AppError("Product slug already exists.", 409, "SLUG_ALREADY_EXISTS");
    }
  }

  if (data.sku && data.sku !== existing.sku) {
    const skuOwner = await productRepository.findBySku(data.sku);
    if (skuOwner) {
      throw new AppError("Product SKU already exists.", 409, "SKU_ALREADY_EXISTS");
    }
  }

  if (data.categoryId) {
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) {
      throw new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND");
    }
  }

  const nextInventory = data.inventory
    ? {
        quantity: data.inventory.quantity ?? existing.inventory?.quantity ?? 0,
        reservedQuantity:
          data.inventory.reservedQuantity ?? existing.inventory?.reservedQuantity ?? 0,
        lowStockThreshold:
          data.inventory.lowStockThreshold ?? existing.inventory?.lowStockThreshold ?? 5,
      }
    : existing.inventory;

  const nextStatus = data.status
    ? resolveProductStatus(data.status, nextInventory)
    : resolveProductStatus(existing.status, nextInventory);

  return productRepository.update(id, {
    ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.sku !== undefined ? { sku: data.sku } : {}),
    ...(data.brand !== undefined ? { brand: data.brand } : {}),
    ...(data.price !== undefined ? { price: data.price } : {}),
    ...(data.comparePrice !== undefined ? { comparePrice: data.comparePrice } : {}),
    ...(data.currency !== undefined ? { currency: data.currency } : {}),
    status: nextStatus,
    ...(data.weight !== undefined ? { weight: data.weight } : {}),
    ...(data.dimensions !== undefined ? { dimensions: data.dimensions } : {}),
    ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
    ...(data.inventory ? { inventory: data.inventory } : {}),
    ...(data.images ? { images: data.images } : {}),
  });
}

export async function deleteProduct(id) {
  const existing = await productRepository.findById(id, { includeAllStatuses: true });

  if (!existing) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  return productRepository.delete(id);
}

export default {
  listProducts,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductsByCategorySlug,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
