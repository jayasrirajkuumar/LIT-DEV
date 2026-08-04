import { prisma } from "../database/prismaClient.js";
import { toPublicOrder } from "../utils/orderMappers.js";

const orderInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
        },
      },
    },
  },
  shippingAddress: true,
  statusHistory: { orderBy: { createdAt: "asc" } },
  cancellationReason: true,
  paymentIntents: {
    include: { transactions: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  },
};

const adminOrderInclude = {
  ...orderInclude,
  user: {
    select: {
      id: true,
      email: true,
      displayName: true,
      phoneNumber: true,
    },
  },
};

export const orderRepository = {
  async findByIdForUser(orderId, userId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: orderInclude,
    });
    return order ? toPublicOrder(order) : null;
  },

  async findById(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: adminOrderInclude,
    });
    return order ? toPublicOrder(order, { includeAdmin: true }) : null;
  },

  async listByUserId(userId, filters = {}) {
    const where = { userId };

    if (filters.status) {
      where.orderStatus = filters.status;
    }

    if (filters.search) {
      where.orderNumber = { contains: filters.search, mode: "insensitive" };
    }

    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    });

    return orders.map((order) => toPublicOrder(order));
  },

  async listAll(filters = {}) {
    const where = {};

    if (filters.status) {
      where.orderStatus = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: "insensitive" } },
        { user: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    let orderBy = { createdAt: "desc" };
    if (filters.sort === "oldest") orderBy = { createdAt: "asc" };
    if (filters.sort === "total_desc") orderBy = { grandTotal: "desc" };
    if (filters.sort === "total_asc") orderBy = { grandTotal: "asc" };

    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const page = Math.max(1, Number(filters.page) || 1);
    const offset = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: adminOrderInclude,
        orderBy,
        take: limit,
        skip: offset,
      }),
    ]);

    if (filters.page || filters.limit) {
      return {
        orders: orders.map((order) => toPublicOrder(order, { includeAdmin: true })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      };
    }

    return orders.map((order) => toPublicOrder(order, { includeAdmin: true }));
  },

  async createWithTransaction(data, tx) {
    return tx.order.create({
      data,
      include: orderInclude,
    });
  },

  async addStatusHistory(orderId, status, note, changedBy, tx = prisma) {
    return tx.orderStatusHistory.create({
      data: { orderId, status, note, changedBy },
    });
  },

  async updateOrder(orderId, data, tx = prisma) {
    return tx.order.update({
      where: { id: orderId },
      data,
      include: orderInclude,
    });
  },

  async countByStatus() {
    const groups = await prisma.order.groupBy({
      by: ["orderStatus"],
      _count: { _all: true },
    });

    return groups.reduce((acc, group) => {
      acc[group.orderStatus] = group._count._all;
      return acc;
    }, {});
  },
};

export default orderRepository;
