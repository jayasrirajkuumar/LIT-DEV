import { prisma } from "../database/prismaClient.js";
import { toPublicProduct } from "../utils/catalogMappers.js";
import { isInStock, isLowStock } from "../utils/inventoryHelpers.js";

const productInclude = {
  category: {
    select: { id: true, name: true, slug: true, isActive: true },
  },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
  inventory: true,
};

function buildWhereClause(filters = {}) {
  const where = {
    status: filters.status ?? "ACTIVE",
    category: filters.activeCategoryOnly === false ? undefined : { isActive: true },
  };

  if (filters.categorySlug) {
    where.category = { ...(where.category ?? {}), slug: filters.categorySlug, isActive: true };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.brand) {
    where.brand = { equals: filters.brand, mode: "insensitive" };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.isFeatured !== undefined) {
    where.isFeatured = filters.isFeatured;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { brand: { contains: filters.search, mode: "insensitive" } },
      { shortDescription: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

function buildOrderBy(sort) {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "popularity":
      return [{ viewCount: "desc" }, { createdAt: "desc" }];
    case "discount":
      return [{ comparePrice: "desc" }, { price: "asc" }];
    case "featured":
      return [{ isFeatured: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
}

function filterByAvailability(products, availability) {
  if (!availability || availability === "all") return products;

  return products.filter((product) => {
    const inStock = isInStock(product.inventory);
    const lowStock = isLowStock(product.inventory);

    if (availability === "in_stock") return inStock;
    if (availability === "out_of_stock") return !inStock;
    if (availability === "low_stock") return lowStock;
    return true;
  });
}

export const productRepository = {
  async findMany(filters = {}) {
    const { page = 1, limit = 20, availability, ...rest } = filters;
    const where = buildWhereClause(rest);
    const orderBy = buildOrderBy(rest.sort);

    const needsAvailabilityPostFilter = Boolean(
      availability && availability !== "all",
    );

    if (needsAvailabilityPostFilter) {
      const products = await prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
      });

      const filtered = filterByAvailability(products, availability);
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return {
        products: paginated.map((product) => toPublicProduct(product)),
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit) || 1,
        },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => toPublicProduct(product)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async findBySlug(slug, { publicOnly = true } = {}) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        ...(publicOnly
          ? { status: "ACTIVE", category: { isActive: true } }
          : {}),
      },
      include: productInclude,
    });

    return product ? toPublicProduct(product) : null;
  },

  async findById(id, { includeAllStatuses = false } = {}) {
    return prisma.product.findFirst({
      where: includeAllStatuses ? { id } : { id, status: { not: "ARCHIVED" } },
      include: productInclude,
    });
  },

  async findBySku(sku) {
    return prisma.product.findUnique({ where: { sku } });
  },

  async findBySlugExact(slug) {
    return prisma.product.findUnique({ where: { slug } });
  },

  async incrementViewCount(id) {
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  async create(data) {
    const { images = [], inventory = {}, ...productData } = data;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: productData,
      });

      await tx.productInventory.create({
        data: {
          productId: created.id,
          quantity: inventory.quantity ?? 0,
          reservedQuantity: inventory.reservedQuantity ?? 0,
          lowStockThreshold: inventory.lowStockThreshold ?? 5,
        },
      });

      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((image, index) => ({
            productId: created.id,
            imageUrl: image.imageUrl,
            altText: image.altText ?? null,
            sortOrder: image.sortOrder ?? index,
            isPrimary: image.isPrimary ?? index === 0,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: productInclude,
      });
    });

    return toPublicProduct(product);
  },

  async update(id, data) {
    const { images, inventory, ...productData } = data;

    const product = await prisma.$transaction(async (tx) => {
      if (Object.keys(productData).length > 0) {
        await tx.product.update({ where: { id }, data: productData });
      }

      if (inventory) {
        await tx.productInventory.upsert({
          where: { productId: id },
          create: {
            productId: id,
            quantity: inventory.quantity ?? 0,
            reservedQuantity: inventory.reservedQuantity ?? 0,
            lowStockThreshold: inventory.lowStockThreshold ?? 5,
          },
          update: {
            ...(inventory.quantity !== undefined ? { quantity: inventory.quantity } : {}),
            ...(inventory.reservedQuantity !== undefined
              ? { reservedQuantity: inventory.reservedQuantity }
              : {}),
            ...(inventory.lowStockThreshold !== undefined
              ? { lowStockThreshold: inventory.lowStockThreshold }
              : {}),
          },
        });
      }

      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image, index) => ({
              productId: id,
              imageUrl: image.imageUrl,
              altText: image.altText ?? null,
              sortOrder: image.sortOrder ?? index,
              isPrimary: image.isPrimary ?? index === 0,
            })),
          });
        }
      }

      return tx.product.findUnique({ where: { id }, include: productInclude });
    });

    return toPublicProduct(product);
  },

  async delete(id) {
    const product = await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: productInclude,
    });

    return toPublicProduct(product);
  },
};

export default productRepository;
