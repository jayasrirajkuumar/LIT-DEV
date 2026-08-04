import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { resendGiftCardEmail, expireOldGiftCards } from "./giftCardService.js";

function decimalToNumber(value) {
  return Number(value?.toString?.() ?? value ?? 0);
}

export async function listAdminGiftCards(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    const term = String(filters.search).trim();
    where.OR = [
      { giftCardCode: { contains: term, mode: "insensitive" } },
      { recipientEmail: { contains: term, mode: "insensitive" } },
      { recipientName: { contains: term, mode: "insensitive" } },
      { senderName: { contains: term, mode: "insensitive" } },
    ];
  }

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Number(filters.limit) || 20);
  const skip = (page - 1) * limit;

  const [total, cards] = await Promise.all([
    prisma.giftCard.count({ where }),
    prisma.giftCard.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, email: true, displayName: true } },
        redeemedBy: { select: { id: true, email: true, displayName: true } },
      },
    }),
  ]);

  return {
    giftCards: cards.map((c) => ({
      id: c.id,
      giftCardCode: c.giftCardCode,
      senderName: c.senderName,
      senderEmail: c.sender?.email ?? null,
      recipientName: c.recipientName,
      recipientEmail: c.recipientEmail,
      amount: decimalToNumber(c.amount),
      remainingBalance: decimalToNumber(c.remainingBalance),
      status: c.status,
      paymentStatus: c.paymentStatus,
      occasion: c.occasion,
      theme: c.theme,
      deliveryType: c.deliveryType,
      scheduledAt: c.scheduledAt?.toISOString() ?? null,
      expiryDate: c.expiryDate.toISOString(),
      createdAt: c.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getAdminGiftCardAnalytics() {
  const [
    total,
    revenueAgg,
    redeemed,
    pending,
    expired,
    scheduled,
    byOccasion,
    byAmount,
    monthly,
  ] = await Promise.all([
    prisma.giftCard.count({ where: { paymentStatus: "CAPTURED" } }),
    prisma.giftCard.aggregate({
      where: { paymentStatus: "CAPTURED" },
      _sum: { grandTotal: true },
    }),
    prisma.giftCard.count({ where: { status: "REDEEMED" } }),
    prisma.giftCard.count({ where: { status: { in: ["PENDING_PAYMENT", "ACTIVE"] } } }),
    prisma.giftCard.count({ where: { status: "EXPIRED" } }),
    prisma.giftCard.count({ where: { status: "SCHEDULED" } }),
    prisma.giftCard.groupBy({
      by: ["occasion"],
      where: { paymentStatus: "CAPTURED" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.giftCard.groupBy({
      by: ["amount"],
      where: { paymentStatus: "CAPTURED" },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
    prisma.$queryRaw`
      SELECT to_char(created_at, 'YYYY-MM') as month, COUNT(*)::int as count, SUM(grand_total)::float as revenue
      FROM gift_cards WHERE payment_status = 'CAPTURED'
      GROUP BY 1 ORDER BY 1 DESC LIMIT 12
    `,
  ]);

  const redemptionRate = total > 0 ? Math.round((redeemed / total) * 100) : 0;

  return {
    totalGiftCards: total,
    revenue: decimalToNumber(revenueAgg._sum.grandTotal),
    redeemed,
    pending,
    expired,
    scheduled,
    redemptionRate,
    topOccasions: byOccasion.map((o) => ({ occasion: o.occasion, count: o._count.id })),
    popularAmounts: byAmount.map((a) => ({
      amount: decimalToNumber(a.amount),
      count: a._count.id,
    })),
    monthlySales: monthly,
  };
}

export async function getAdminGiftCardById(id) {
  const card = await prisma.giftCard.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, email: true, displayName: true } },
      redeemedBy: { select: { id: true, email: true, displayName: true } },
      activityLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!card) throw new AppError("Gift card not found.", 404, "NOT_FOUND");

  return {
    id: card.id,
    giftCardCode: card.giftCardCode,
    senderName: card.senderName,
    sender: card.sender,
    recipientName: card.recipientName,
    recipientEmail: card.recipientEmail,
    recipientPhone: card.recipientPhone,
    amount: decimalToNumber(card.amount),
    remainingBalance: decimalToNumber(card.remainingBalance),
    status: card.status,
    paymentStatus: card.paymentStatus,
    occasion: card.occasion,
    theme: card.theme,
    message: card.message,
    deliveryMethod: card.deliveryMethod,
    deliveryType: card.deliveryType,
    scheduledAt: card.scheduledAt?.toISOString() ?? null,
    expiryDate: card.expiryDate.toISOString(),
    grandTotal: decimalToNumber(card.grandTotal),
    platformFee: decimalToNumber(card.platformFee),
    gstAmount: decimalToNumber(card.gstAmount),
    discountAmount: decimalToNumber(card.discountAmount),
    emailSentAt: card.emailSentAt?.toISOString() ?? null,
    deliveredAt: card.deliveredAt?.toISOString() ?? null,
    redeemedAt: card.redeemedAt?.toISOString() ?? null,
    redeemedBy: card.redeemedBy,
    createdAt: card.createdAt.toISOString(),
    timeline: card.activityLogs.map((log) => ({
      id: log.id,
      action: log.action,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

export async function cancelAdminGiftCard(id, adminUserId) {
  const card = await prisma.giftCard.findUnique({ where: { id } });
  if (!card) throw new AppError("Gift card not found.", 404, "NOT_FOUND");
  if (card.status === "REDEEMED") {
    throw new AppError("Cannot cancel a redeemed gift card.", 409, "INVALID_STATE");
  }

  await prisma.giftCard.update({
    where: { id },
    data: { status: "CANCELLED", paymentStatus: "CANCELLED" },
  });

  await prisma.giftCardActivityLog.create({
    data: {
      giftCardId: id,
      action: "CANCELLED",
      message: "Cancelled by admin",
      metadata: { adminUserId },
    },
  });

  return { cancelled: true };
}

export async function listAdminGiftCardTemplates() {
  return prisma.giftCardTemplate.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function updateAdminGiftCardTemplate(id, data) {
  return prisma.giftCardTemplate.update({ where: { id }, data });
}

export async function runGiftCardMaintenance() {
  const expired = await expireOldGiftCards();
  return { expired };
}

export { resendGiftCardEmail };

export default {
  listAdminGiftCards,
  getAdminGiftCardAnalytics,
  getAdminGiftCardById,
  cancelAdminGiftCard,
  listAdminGiftCardTemplates,
  updateAdminGiftCardTemplate,
  resendGiftCardEmail,
  runGiftCardMaintenance,
};
