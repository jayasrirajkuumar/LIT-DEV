import { prisma } from "../database/prismaClient.js";
import { toPublicProduct } from "../utils/catalogMappers.js";
import slugify from "../utils/slugify.js";

const wishlistItemInclude = {
  product: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      inventory: true,
    },
  },
};

function mapWishlistItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    collectionId: item.collectionId,
    product: toPublicProduct(item.product),
    createdAt: item.createdAt.toISOString(),
  };
}

function mapCollection(collection) {
  const items = (collection.items ?? []).map(mapWishlistItem);
  return {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    isDefault: collection.isDefault,
    displayOrder: collection.displayOrder,
    itemCount: items.length,
    items,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
  };
}

function mapWishlist(wishlist) {
  const collections = (wishlist.collections ?? []).map(mapCollection);
  const allItems = collections.flatMap((c) => c.items);
  return {
    id: wishlist.id,
    userId: wishlist.userId,
    collections,
    items: allItems,
    itemCount: allItems.length,
    createdAt: wishlist.createdAt.toISOString(),
    updatedAt: wishlist.updatedAt.toISOString(),
  };
}

async function getOrCreateWishlist(userId) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      collections: {
        orderBy: [{ isDefault: "desc" }, { displayOrder: "asc" }],
        include: {
          items: { include: wishlistItemInclude, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: {
        userId,
        collections: {
          create: {
            name: "Favorites",
            slug: "favorites",
            isDefault: true,
            displayOrder: 0,
          },
        },
      },
      include: {
        collections: {
          orderBy: [{ isDefault: "desc" }, { displayOrder: "asc" }],
          include: {
            items: { include: wishlistItemInclude, orderBy: { createdAt: "desc" } },
          },
        },
      },
    });
  } else if (wishlist.collections.length === 0) {
    await prisma.wishlistCollection.create({
      data: {
        wishlistId: wishlist.id,
        name: "Favorites",
        slug: "favorites",
        isDefault: true,
        displayOrder: 0,
      },
    });
    return getOrCreateWishlist(userId);
  }

  return wishlist;
}

async function getDefaultCollection(userId) {
  const wishlist = await getOrCreateWishlist(userId);
  return wishlist.collections.find((c) => c.isDefault) ?? wishlist.collections[0];
}

async function uniqueSlug(wishlistId, name, excludeId = null) {
  let base = slugify(name) || "collection";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.wishlistCollection.findFirst({
      where: {
        wishlistId,
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
    if (!existing) return candidate;
    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export const wishlistRepository = {
  async findByUserId(userId) {
    const wishlist = await getOrCreateWishlist(userId);
    return mapWishlist(wishlist);
  },

  async getItemCount(userId) {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        collections: { include: { _count: { select: { items: true } } } },
      },
    });
    if (!wishlist) return 0;
    return wishlist.collections.reduce((sum, c) => sum + c._count.items, 0);
  },

  async listCollections(userId) {
    const wishlist = await getOrCreateWishlist(userId);
    return wishlist.collections.map(mapCollection);
  },

  async createCollection(userId, { name }) {
    const wishlist = await getOrCreateWishlist(userId);
    const slug = await uniqueSlug(wishlist.id, name);
    const maxOrder = wishlist.collections.reduce((max, c) => Math.max(max, c.displayOrder), -1);

    await prisma.wishlistCollection.create({
      data: {
        wishlistId: wishlist.id,
        name: name.trim(),
        slug,
        displayOrder: maxOrder + 1,
      },
    });

    return this.findByUserId(userId);
  },

  async updateCollection(userId, collectionId, { name }) {
    const wishlist = await getOrCreateWishlist(userId);
    const collection = wishlist.collections.find((c) => c.id === collectionId);
    if (!collection) throw new Error("COLLECTION_NOT_FOUND");

    const slug = await uniqueSlug(wishlist.id, name, collectionId);
    await prisma.wishlistCollection.update({
      where: { id: collectionId },
      data: { name: name.trim(), slug },
    });

    return this.findByUserId(userId);
  },

  async deleteCollection(userId, collectionId) {
    const wishlist = await getOrCreateWishlist(userId);
    const collection = wishlist.collections.find((c) => c.id === collectionId);
    if (!collection) throw new Error("COLLECTION_NOT_FOUND");
    if (collection.isDefault) throw new Error("CANNOT_DELETE_DEFAULT");

    await prisma.wishlistCollection.delete({ where: { id: collectionId } });
    return this.findByUserId(userId);
  },

  async setDefaultCollection(userId, collectionId) {
    const wishlist = await getOrCreateWishlist(userId);
    if (!wishlist.collections.some((c) => c.id === collectionId)) {
      throw new Error("COLLECTION_NOT_FOUND");
    }

    await prisma.$transaction([
      prisma.wishlistCollection.updateMany({
        where: { wishlistId: wishlist.id },
        data: { isDefault: false },
      }),
      prisma.wishlistCollection.update({
        where: { id: collectionId },
        data: { isDefault: true },
      }),
    ]);

    return this.findByUserId(userId);
  },

  async addItem(userId, productId, collectionId = null) {
    const wishlist = await getOrCreateWishlist(userId);
    const collection =
      wishlist.collections.find((c) => c.id === collectionId) ??
      wishlist.collections.find((c) => c.isDefault) ??
      wishlist.collections[0];

    await prisma.wishlistItem.upsert({
      where: {
        collectionId_productId: { collectionId: collection.id, productId },
      },
      update: {},
      create: { collectionId: collection.id, productId },
    });

    return this.findByUserId(userId);
  },

  async removeItem(userId, productId, collectionId = null) {
    const wishlist = await getOrCreateWishlist(userId);
    const collections = collectionId
      ? wishlist.collections.filter((c) => c.id === collectionId)
      : wishlist.collections;

    const collectionIds = collections.map((c) => c.id);
    if (!collectionIds.length) return this.findByUserId(userId);

    await prisma.wishlistItem.deleteMany({
      where: { collectionId: { in: collectionIds }, productId },
    });

    return this.findByUserId(userId);
  },

  async toggleItem(userId, productId, collectionId = null) {
    const wishlist = await getOrCreateWishlist(userId);
    const collection =
      wishlist.collections.find((c) => c.id === collectionId) ??
      wishlist.collections.find((c) => c.isDefault) ??
      wishlist.collections[0];

    const existing = await prisma.wishlistItem.findUnique({
      where: { collectionId_productId: { collectionId: collection.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      const updated = await this.findByUserId(userId);
      return { ...updated, added: false, collectionId: collection.id };
    }

    await prisma.wishlistItem.create({
      data: { collectionId: collection.id, productId },
    });

    const updated = await this.findByUserId(userId);
    return { ...updated, added: true, collectionId: collection.id };
  },

  async moveItem(userId, productId, targetCollectionId) {
    const wishlist = await getOrCreateWishlist(userId);
    const target = wishlist.collections.find((c) => c.id === targetCollectionId);
    if (!target) throw new Error("COLLECTION_NOT_FOUND");

    const sourceItem = await prisma.wishlistItem.findFirst({
      where: {
        productId,
        collection: { wishlistId: wishlist.id },
      },
    });

    if (!sourceItem) throw new Error("ITEM_NOT_FOUND");
    if (sourceItem.collectionId === targetCollectionId) return this.findByUserId(userId);

    await prisma.$transaction([
      prisma.wishlistItem.delete({ where: { id: sourceItem.id } }),
      prisma.wishlistItem.upsert({
        where: {
          collectionId_productId: { collectionId: targetCollectionId, productId },
        },
        update: {},
        create: { collectionId: targetCollectionId, productId },
      }),
    ]);

    return this.findByUserId(userId);
  },

  async copyItem(userId, productId, targetCollectionId) {
    const wishlist = await getOrCreateWishlist(userId);
    const target = wishlist.collections.find((c) => c.id === targetCollectionId);
    if (!target) throw new Error("COLLECTION_NOT_FOUND");

    await prisma.wishlistItem.upsert({
      where: {
        collectionId_productId: { collectionId: targetCollectionId, productId },
      },
      update: {},
      create: { collectionId: targetCollectionId, productId },
    });

    return this.findByUserId(userId);
  },

  async isInWishlist(userId, productId) {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) return false;

    const item = await prisma.wishlistItem.findFirst({
      where: {
        productId,
        collection: { wishlistId: wishlist.id },
      },
    });

    return Boolean(item);
  },

  async getProductCollections(userId, productId) {
    const wishlist = await getOrCreateWishlist(userId);
    return wishlist.collections
      .filter((c) => c.items.some((i) => i.productId === productId))
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  },
};

export default wishlistRepository;
