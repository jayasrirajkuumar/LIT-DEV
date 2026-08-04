import { prisma } from "../database/prismaClient.js";

export async function getAdminWishlistCollections(req, res) {
  const limit = req.query.limit ? Number(req.query.limit) : 100;

  const collections = await prisma.wishlistCollection.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    include: {
      wishlist: {
        include: {
          user: { select: { id: true, email: true, displayName: true } },
        },
      },
      _count: { select: { items: true } },
    },
  });

  res.json({
    success: true,
    data: {
      collections: collections.map((collection) => ({
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        isDefault: collection.isDefault,
        itemCount: collection._count.items,
        user: collection.wishlist.user,
        updatedAt: collection.updatedAt.toISOString(),
        createdAt: collection.createdAt.toISOString(),
      })),
    },
  });
}

export default { getAdminWishlistCollections };
