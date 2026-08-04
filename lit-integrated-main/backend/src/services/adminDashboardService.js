import { prisma } from "../database/prismaClient.js";
import { toPublicProduct } from "../utils/catalogMappers.js";
import { isLowStock, isInStock } from "../utils/inventoryHelpers.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import { userRepository, toPublicUser } from "../repositories/userRepository.js";
import { addressRepository } from "../repositories/addressRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { AppError } from "../utils/AppError.js";
import { auditLogService } from "./auditLogService.js";
import { getSupportDashboardStats } from "./supportService.js";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function startOfMonth(date = new Date()) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

function buildPagination(filters, total) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    offset: (page - 1) * limit,
  };
}

function buildProductOrderBy(sort) {
  switch (sort) {
    case "name":
      return { name: "asc" };
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    case "stock":
      return { inventory: { quantity: "desc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

function buildProductWhere(filters = {}) {
  const where = {};

  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.brand) {
    where.brand = { contains: String(filters.brand).trim(), mode: "insensitive" };
  }
  if (filters.isFeatured !== undefined && filters.isFeatured !== "") {
    where.isFeatured = filters.isFeatured === "true" || filters.isFeatured === true;
  }
  if (filters.search) {
    const term = String(filters.search).trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
      { brand: { contains: term, mode: "insensitive" } },
    ];
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice !== undefined) where.price.lte = Number(filters.maxPrice);
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }
  if (filters.stockStatus === "out") {
    where.OR = [
      ...(where.OR ?? []),
      { status: "OUT_OF_STOCK" },
      { inventory: { quantity: { lte: 0 } } },
    ];
  } else if (filters.stockStatus === "low") {
    where.inventory = { quantity: { gt: 0, lte: 5 } };
  } else if (filters.stockStatus === "in") {
    where.inventory = { quantity: { gt: 0 } };
  }

  return where;
}

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const capturedWhere = { paymentStatus: "CAPTURED" };

  const [
    productCount,
    activeProductCount,
    categoryCount,
    customerCount,
    orderCount,
    revenueAggregate,
    revenueToday,
    revenueWeek,
    revenueMonth,
    ordersToday,
    ordersThisWeek,
    ordersThisMonth,
    pendingOrders,
    cancelledOrders,
    outOfStockCount,
    recentOrders,
    lowStockProducts,
    outOfStockProducts,
    recentUsers,
    topProductGroups,
    topCategoryGroups,
    recentActivity,
    supportStats,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { grandTotal: true }, where: capturedWhere }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { ...capturedWhere, createdAt: { gte: todayStart } },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { ...capturedWhere, createdAt: { gte: weekStart } },
    }),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { ...capturedWhere, createdAt: { gte: monthStart } },
    }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.order.count({ where: { orderStatus: "PENDING" } }),
    prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
    prisma.product.count({ where: { status: "OUT_OF_STOCK" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        grandTotal: true,
        createdAt: true,
        user: { select: { email: true, displayName: true } },
      },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { inventory: true, category: { select: { name: true, slug: true } } },
      take: 100,
    }),
    prisma.product.findMany({
      where: { status: "OUT_OF_STOCK" },
      take: 10,
      select: { id: true, name: true, slug: true, sku: true },
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { _all: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    auditLogService.list({ limit: 10, offset: 0 }),
    getSupportDashboardStats(),
  ]);

  const lowStock = lowStockProducts
    .filter((product) => isLowStock(product.inventory))
    .slice(0, 10)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      quantity: product.inventory?.quantity ?? 0,
      category: product.category?.name,
    }));

  const productIds = topProductGroups.map((g) => g.productId);
  const categoryIds = topCategoryGroups.map((g) => g.categoryId);
  const [topProductsData, topCategoriesData] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, slug: true, sku: true },
        })
      : [],
    categoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, slug: true },
        })
      : [],
  ]);

  const productMap = Object.fromEntries(topProductsData.map((p) => [p.id, p]));
  const categoryMap = Object.fromEntries(topCategoriesData.map((c) => [c.id, c]));

  return {
    cards: {
      products: productCount,
      activeProducts: activeProductCount,
      categories: categoryCount,
      orders: orderCount,
      revenue: Number(revenueAggregate._sum.grandTotal ?? 0),
      revenueToday: Number(revenueToday._sum.grandTotal ?? 0),
      revenueWeek: Number(revenueWeek._sum.grandTotal ?? 0),
      revenueMonth: Number(revenueMonth._sum.grandTotal ?? 0),
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      pendingOrders,
      cancelledOrders,
      outOfStock: outOfStockCount,
      customers: customerCount,
      inventoryAlerts: lowStock.length,
    },
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      total: order.grandTotal.toString(),
      customer: order.user.displayName || order.user.email,
      createdAt: order.createdAt.toISOString(),
    })),
    recentUsers: recentUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })),
    lowStockProducts: lowStock,
    outOfStockProducts: outOfStockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
    })),
    topProducts: topProductGroups.map((group) => ({
      product: productMap[group.productId] ?? { id: group.productId },
      unitsSold: group._sum.quantity ?? 0,
      orderCount: group._count._all,
    })),
    topCategories: topCategoryGroups.map((group) => ({
      category: categoryMap[group.categoryId] ?? { id: group.categoryId },
      productCount: group._count._all,
    })),
    recentActivity: recentActivity.items,
    support: supportStats,
  };
}

export async function listAdminInventory(filters = {}) {
  const where = buildProductWhere(filters);
  const pagination = buildPagination(filters, 0);
  const orderBy = buildProductOrderBy(filters.sort);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        inventory: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy,
      skip: pagination.offset,
      take: pagination.limit,
    }),
  ]);

  pagination.total = total;
  pagination.totalPages = Math.max(1, Math.ceil(total / pagination.limit));

  const inventory = await Promise.all(
    products.map(async (product) => {
      let inventoryRecord = product.inventory;
      if (!inventoryRecord) {
        inventoryRecord = await prisma.productInventory.create({
          data: {
            productId: product.id,
            quantity: 0,
            reservedQuantity: 0,
            lowStockThreshold: 5,
          },
        });
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        status: product.status,
        category: product.category,
        inventory: {
          quantity: inventoryRecord.quantity ?? 0,
          reservedQuantity: inventoryRecord.reservedQuantity ?? 0,
          lowStockThreshold: inventoryRecord.lowStockThreshold ?? 5,
          isInStock: isInStock(inventoryRecord),
          isLowStock: isLowStock(inventoryRecord),
          updatedAt: inventoryRecord.updatedAt?.toISOString() ?? null,
        },
      };
    }),
  );

  if (filters.page || filters.limit) {
    return { inventory, pagination };
  }

  return inventory;
}

export async function updateInventory(productId, data) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });

  if (!product) return null;

  const inventory = await prisma.productInventory.upsert({
    where: { productId },
    update: {
      quantity: data.quantity ?? undefined,
      reservedQuantity: data.reservedQuantity ?? undefined,
      lowStockThreshold: data.lowStockThreshold ?? undefined,
    },
    create: {
      productId,
      quantity: data.quantity ?? 0,
      reservedQuantity: data.reservedQuantity ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 5,
    },
  });

  return {
    productId,
    quantity: inventory.quantity,
    reservedQuantity: inventory.reservedQuantity,
    lowStockThreshold: inventory.lowStockThreshold,
    updatedAt: inventory.updatedAt.toISOString(),
  };
}

export async function listAdminProducts(filters = {}) {
  const where = buildProductWhere(filters);
  const pagination = buildPagination(filters, 0);
  const orderBy = buildProductOrderBy(filters.sort);

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        inventory: true,
      },
      orderBy,
      skip: pagination.offset,
      take: pagination.limit,
    }),
  ]);

  pagination.total = total;
  pagination.totalPages = Math.max(1, Math.ceil(total / pagination.limit));

  return {
    products: products.map((product) => toPublicProduct(product)),
    pagination,
  };
}

export async function listAdminCustomers(filters = {}) {
  const where = {};

  if (filters.role) {
    where.role = filters.role;
  } else {
    where.role = "CUSTOMER";
  }

  if (filters.isActive !== undefined && filters.isActive !== "") {
    where.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  if (filters.search) {
    const term = String(filters.search).trim();
    where.OR = [
      { email: { contains: term, mode: "insensitive" } },
      { displayName: { contains: term, mode: "insensitive" } },
      { phoneNumber: { contains: term, mode: "insensitive" } },
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  const pagination = buildPagination(filters, 0);
  let orderBy = { createdAt: "desc" };
  if (filters.sort === "name") orderBy = { displayName: "asc" };
  if (filters.sort === "oldest") orderBy = { createdAt: "asc" };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy,
      skip: pagination.offset,
      take: pagination.limit,
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
        _count: { select: { addresses: true, orders: true } },
      },
    }),
  ]);

  pagination.total = total;
  pagination.totalPages = Math.max(1, Math.ceil(total / pagination.limit));

  const customers = users.map((user) => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isActive: user.isActive,
    addressCount: user._count.addresses,
    orderCount: user._count.orders,
    createdAt: user.createdAt.toISOString(),
    lastLogin: user.lastLogin?.toISOString() ?? null,
  }));

  if (filters.page || filters.limit) {
    return { customers, pagination };
  }

  return customers;
}

export async function getAdminCustomerById(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("Customer not found.", 404, "USER_NOT_FOUND");
  }

  const [addresses, orders] = await Promise.all([
    addressRepository.findAllByUserId(userId),
    orderRepository.listByUserId(userId, { limit: 50 }),
  ]);

  return {
    user: toPublicUser(user),
    addresses,
    orders,
  };
}

export async function updateAdminCustomer(userId, data) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("Customer not found.", 404, "USER_NOT_FOUND");
  }

  if (data.isActive === undefined) {
    throw new AppError("No updatable fields provided.", 400, "VALIDATION_ERROR");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: data.isActive },
  });

  return toPublicUser(updated);
}

export async function getAdminProductById(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      inventory: true,
    },
  });

  if (!product) {
    throw new AppError("Product not found.", 404, "PRODUCT_NOT_FOUND");
  }

  return toPublicProduct(product);
}

export async function listAdminCategories(filters = {}) {
  const where = {};

  if (filters.search) {
    const term = String(filters.search).trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { slug: { contains: term, mode: "insensitive" } },
    ];
  }

  if (filters.isActive !== undefined && filters.isActive !== "") {
    where.isActive = filters.isActive === "true" || filters.isActive === true;
  }

  let orderBy = { displayOrder: "asc" };
  if (filters.sort === "name") orderBy = { name: "asc" };
  if (filters.sort === "newest") orderBy = { createdAt: "desc" };

  if (filters.page || filters.limit) {
    const pagination = buildPagination(filters, 0);
    const [total, categories] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        orderBy,
        skip: pagination.offset,
        take: pagination.limit,
        include: { _count: { select: { products: true } } },
      }),
    ]);
    pagination.total = total;
    pagination.totalPages = Math.max(1, Math.ceil(total / pagination.limit));
    return {
      categories: categories.map((c) => ({
        ...c,
        productCount: c._count.products,
      })),
      pagination,
    };
  }

  return categoryRepository.findAllAdmin();
}

export default {
  getDashboardStats,
  listAdminInventory,
  updateInventory,
  listAdminProducts,
  getAdminProductById,
  listAdminCategories,
  listAdminCustomers,
  getAdminCustomerById,
  updateAdminCustomer,
};
