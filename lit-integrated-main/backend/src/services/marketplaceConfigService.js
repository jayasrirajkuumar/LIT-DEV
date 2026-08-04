import { prisma } from "../database/prismaClient.js";
import slugify from "../utils/slugify.js";

export async function listAnnouncements(activeOnly = true) {
  const rows = await prisma.marketplaceAnnouncement.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    sortOrder: r.sortOrder,
    isActive: r.isActive,
  }));
}

export async function listBrands(activeOnly = true) {
  const rows = await prisma.marketplaceBrand.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    logoUrl: r.logoUrl,
    sortOrder: r.sortOrder,
    isActive: r.isActive,
  }));
}

export async function listSortOptions(activeOnly = true) {
  const rows = await prisma.marketplaceSortOption.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({ id: r.id, key: r.key, label: r.label, isActive: r.isActive }));
}

export async function listFilterOptions(activeOnly = true) {
  const rows = await prisma.marketplaceFilterOption.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    key: r.key,
    label: r.label,
    type: r.type,
    config: r.config,
    isActive: r.isActive,
  }));
}

export async function getMarketplacePublicConfig() {
  const [announcements, brands, sortOptions, filterOptions] = await Promise.all([
    listAnnouncements(true),
    listBrands(true),
    listSortOptions(true),
    listFilterOptions(true),
  ]);
  return { announcements, brands, sortOptions, filterOptions };
}

export async function createBrand(payload) {
  const slug = payload.slug || slugify(payload.name);
  return prisma.marketplaceBrand.create({
    data: {
      name: payload.name,
      slug,
      logoUrl: payload.logoUrl ?? null,
      sortOrder: payload.sortOrder ?? 0,
      isActive: payload.isActive ?? true,
    },
  });
}

export async function updateBrand(id, payload) {
  return prisma.marketplaceBrand.update({
    where: { id },
    data: {
      name: payload.name,
      slug: payload.slug,
      logoUrl: payload.logoUrl,
      sortOrder: payload.sortOrder,
      isActive: payload.isActive,
    },
  });
}

export async function deleteBrand(id) {
  await prisma.marketplaceBrand.delete({ where: { id } });
  return { deleted: true };
}

export async function upsertAnnouncement(id, payload) {
  if (id) {
    return prisma.marketplaceAnnouncement.update({
      where: { id },
      data: payload,
    });
  }
  return prisma.marketplaceAnnouncement.create({ data: payload });
}

export async function deleteAnnouncement(id) {
  await prisma.marketplaceAnnouncement.delete({ where: { id } });
  return { deleted: true };
}

export async function upsertSortOption(id, payload) {
  if (id) {
    return prisma.marketplaceSortOption.update({ where: { id }, data: payload });
  }
  return prisma.marketplaceSortOption.create({ data: payload });
}

export async function upsertFilterOption(id, payload) {
  if (id) {
    return prisma.marketplaceFilterOption.update({ where: { id }, data: payload });
  }
  return prisma.marketplaceFilterOption.create({ data: payload });
}

export async function listAdminCarts(limit = 50) {
  const carts = await prisma.cart.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, email: true, displayName: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, price: true, sku: true } },
        },
      },
    },
  });

  return carts.map((cart) => ({
    id: cart.id,
    user: cart.user,
    itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: cart.items.reduce(
      (sum, i) => sum + Number(i.product.price) * i.quantity,
      0,
    ),
    status: cart.items.length ? "ACTIVE" : "EMPTY",
    updatedAt: cart.updatedAt.toISOString(),
    items: cart.items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      slug: i.product.slug,
      sku: i.product.sku,
      quantity: i.quantity,
      price: Number(i.product.price),
      link: `/shop/product/${i.product.slug}`,
    })),
  }));
}

export async function listAdminWishlists(limit = 50) {
  const items = await prisma.wishlistItem.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, name: true, slug: true, price: true, brand: true } },
      collection: {
        include: {
          wishlist: {
            include: { user: { select: { id: true, email: true, displayName: true } } },
          },
        },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    user: item.collection.wishlist.user,
    collection: item.collection.name,
    product: {
      id: item.product.id,
      name: item.product.name,
      brand: item.product.brand,
      price: Number(item.product.price),
      link: `/shop/product/${item.product.slug}`,
    },
    addedAt: item.createdAt.toISOString(),
  }));
}

export default {
  getMarketplacePublicConfig,
  listAnnouncements,
  listBrands,
  listSortOptions,
  listFilterOptions,
  createBrand,
  updateBrand,
  deleteBrand,
  upsertAnnouncement,
  deleteAnnouncement,
  upsertSortOption,
  upsertFilterOption,
  listAdminCarts,
  listAdminWishlists,
};
