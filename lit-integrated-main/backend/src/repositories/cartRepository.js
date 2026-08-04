import { prisma } from "../database/prismaClient.js";
import { toPublicProduct } from "../utils/catalogMappers.js";

const cartItemInclude = {
  product: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      inventory: true,
    },
  },
};

function mapCartItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    quantity: item.quantity,
    product: toPublicProduct(item.product),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function mapCart(cart) {
  const items = (cart.items ?? []).map(mapCartItem);
  return {
    id: cart.id,
    userId: cart.userId,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: cartItemInclude, orderBy: { createdAt: "desc" } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: cartItemInclude, orderBy: { createdAt: "desc" } } },
    });
  }

  return cart;
}

export const cartRepository = {
  async findByUserId(userId) {
    const cart = await getOrCreateCart(userId);
    return mapCart(cart);
  },

  async getItemCount(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { select: { quantity: true } } },
    });

    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  async addItem(userId, productId, quantity = 1) {
    const cart = await getOrCreateCart(userId);

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.findByUserId(userId);
  },

  async updateItemQuantity(userId, productId, quantity) {
    const cart = await getOrCreateCart(userId);

    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    } else {
      await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        update: { quantity },
        create: { cartId: cart.id, productId, quantity },
      });
    }

    return this.findByUserId(userId);
  },

  async removeItem(userId, productId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return {
        id: null,
        userId,
        items: [],
        itemCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    return this.findByUserId(userId);
  },

  async clear(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.findByUserId(userId);
  },
};

export default cartRepository;
