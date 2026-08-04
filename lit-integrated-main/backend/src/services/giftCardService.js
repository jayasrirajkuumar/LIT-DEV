import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { storeSettingsService } from "./storeSettingsService.js";
import {
  generateGiftCardCode,
  generatePin,
  createPlaceholderPinHash,
  hashPin,
  verifyPin,
  normalizeGiftCardCode,
} from "../utils/giftCardHelpers.js";
import { getPaymentProvider } from "./payments/paymentProviderFactory.js";
import { giftCardEmailService } from "./giftCardEmailService.js";
import { adminNotificationService } from "./adminNotificationService.js";
import { createUserNotification } from "./customerNotificationService.js";
import { logger } from "../utils/logger.js";
import { withTimeout } from "../utils/withTimeout.js";

async function getGiftCardSettings() {
  const settings = await storeSettingsService.get();
  return settings.giftCards ?? {
    enabled: true,
    minAmount: 100,
    maxAmount: 50000,
    expiryMonths: 12,
    platformFeePercent: 0,
    gstPercent: 18,
    presetAmounts: [250, 500, 1000, 2000, 5000, 10000],
  };
}

async function logActivity(giftCardId, action, message, metadata = null) {
  await prisma.giftCardActivityLog.create({
    data: { giftCardId, action, message, metadata },
  });
}

function decimalToNumber(value) {
  return Number(value?.toString?.() ?? value ?? 0);
}

function mapGiftCard(card, { includePin = false, pin = null } = {}) {
  return {
    id: card.id,
    giftCardCode: card.giftCardCode,
    ...(includePin && pin ? { pin } : {}),
    senderName: card.senderName,
    recipientName: card.recipientName,
    recipientEmail: card.recipientEmail,
    recipientPhone: card.recipientPhone,
    amount: decimalToNumber(card.amount),
    remainingBalance: decimalToNumber(card.remainingBalance),
    currency: card.currency,
    message: card.message,
    occasion: card.occasion,
    theme: card.theme,
    deliveryMethod: card.deliveryMethod,
    deliveryType: card.deliveryType,
    scheduledAt: card.scheduledAt?.toISOString() ?? null,
    timezone: card.timezone,
    status: card.status,
    paymentStatus: card.paymentStatus,
    redeemedAt: card.redeemedAt?.toISOString() ?? null,
    expiryDate: card.expiryDate.toISOString(),
    qrCodeData: card.qrCodeData,
    platformFee: decimalToNumber(card.platformFee),
    gstAmount: decimalToNumber(card.gstAmount),
    discountAmount: decimalToNumber(card.discountAmount),
    couponCode: card.couponCode,
    grandTotal: decimalToNumber(card.grandTotal),
    emailSentAt: card.emailSentAt?.toISOString() ?? null,
    deliveredAt: card.deliveredAt?.toISOString() ?? null,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

async function calculatePricing(amount, couponCode, userId) {
  const config = await getGiftCardSettings();
  const baseAmount = Number(amount);
  let discount = 0;

  if (couponCode && userId) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: couponCode.toUpperCase(),
        userId,
        isUsed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
    if (coupon) {
      discount = decimalToNumber(coupon.amount);
    }
  }

  const platformFee = (baseAmount * Number(config.platformFeePercent || 0)) / 100;
  const taxable = Math.max(0, baseAmount - discount);
  const gstAmount = (taxable * Number(config.gstPercent || 18)) / 100;
  const grandTotal = Math.max(0, taxable + platformFee + gstAmount);

  return {
    amount: baseAmount,
    platformFee,
    gstAmount,
    discountAmount: discount,
    grandTotal,
    couponApplied: discount > 0,
  };
}

async function reserveGiftCardCode() {
  return generateGiftCardCode();
}

function isUniqueConstraintError(error) {
  return error?.code === "P2002";
}

function buildRedeemUrl(code) {
  return `${process.env.FRONTEND_URL || "http://localhost:5173"}/gift-cards/redeem?code=${encodeURIComponent(code)}`;
}

async function createGiftCardWithUniqueCode(tx, data, { maxAttempts = 5 } = {}) {
  let code = data.giftCardCode ?? generateGiftCardCode();

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (attempt > 0) {
      code = generateGiftCardCode();
    }

    try {
      return await tx.giftCard.create({
        data: {
          ...data,
          giftCardCode: code,
          qrCodeData: buildRedeemUrl(code),
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < maxAttempts - 1) continue;
      throw error;
    }
  }

  throw new AppError("Unable to generate gift card code.", 500, "CODE_GENERATION_FAILED");
}

function isConnectionError(error) {
  const code = error?.code;
  const message = String(error?.message ?? "");
  return (
    code === "P1001" ||
    code === "P1002" ||
    code === "P1017" ||
    message.includes("Can't reach database server") ||
    message.includes("ConnectionReset") ||
    message.includes("connection was forcibly closed")
  );
}

async function createGiftCardStandalone(data) {
  const { scheduledAt, recipientPhone, couponCode, message, ...rest } = data;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateGiftCardCode();
    const createData = {
      ...rest,
      giftCardCode: code,
      qrCodeData: buildRedeemUrl(code),
      ...(scheduledAt ? { scheduledAt } : {}),
      ...(recipientPhone ? { recipientPhone } : {}),
      ...(couponCode ? { couponCode } : {}),
      ...(message ? { message } : {}),
    };

    try {
      return await withTimeout(
        prisma.giftCard.create({ data: createData }),
        15_000,
        "Saving the gift card timed out. Check your network connection and try again.",
        "DATABASE_TIMEOUT",
      );
    } catch (error) {
      if (isUniqueConstraintError(error) && attempt < 4) {
        logger.warn("Gift card code collision — retrying", { attempt: attempt + 1 });
        continue;
      }
      if (error instanceof AppError) throw error;
      if (isConnectionError(error)) {
        throw new AppError(
          "Database is temporarily unavailable. Ensure your network/VPN to PostgreSQL is active and try again.",
          503,
          "DATABASE_UNAVAILABLE",
        );
      }
      throw error;
    }
  }

  throw new AppError("Unable to generate a unique gift card code.", 500, "CODE_GENERATION_FAILED");
}

function queuePostPurchaseSideEffects(userId, card, pin, isScheduled, paymentProvider, grandTotal) {
  setImmediate(() => {
    void prisma.giftCardActivityLog
      .create({
        data: {
          giftCardId: card.id,
          action: "PURCHASED",
          message: `Gift card purchased via ${paymentProvider}`,
          metadata: { amount: grandTotal },
        },
      })
      .catch((error) => {
        logger.warn("Gift card activity log failed", {
          giftCardId: card.id,
          message: error.message,
        });
      });

    if (!isScheduled) {
      void deliverGiftCard(card.id, pin).catch((error) => {
        logger.warn("Background gift card delivery failed", {
          giftCardId: card.id,
          message: error.message,
        });
      });
    }

    void Promise.resolve(
      adminNotificationService.notifyGiftCardPurchase?.({
        giftCardId: card.id,
        amount: decimalToNumber(card.amount),
        code: card.giftCardCode,
      }),
    ).catch(() => {});

    if (userId) {
      void createUserNotification({
        userId,
        type: "GIFT_CARD_PURCHASED",
        title: "Gift card purchased",
        message: `Your gift card ${card.giftCardCode} for ${card.recipientName} is ready.`,
        entityType: "gift_card",
        entityId: card.id,
      }).catch((error) => {
        logger.warn("Gift card purchase notification failed", {
          giftCardId: card.id,
          message: error.message,
        });
      });
    }
  });
}

export async function getGiftCardConfig() {
  const config = await getGiftCardSettings();
  const templates = await prisma.giftCardTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return {
    ...config,
    templates: templates.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      imageUrl: t.imageUrl,
      gradient: t.gradient,
    })),
  };
}

export async function previewGiftCardPurchase(payload, userId) {
  const config = await getGiftCardSettings();
  if (!config.enabled) {
    throw new AppError("Gift cards are currently unavailable.", 503, "GIFT_CARDS_DISABLED");
  }

  const amount = Number(payload.amount);
  if (amount < config.minAmount || amount > config.maxAmount) {
    throw new AppError(
      `Amount must be between ₹${config.minAmount} and ₹${config.maxAmount}.`,
      400,
      "VALIDATION_ERROR",
    );
  }

  const pricing = await calculatePricing(amount, payload.couponCode, userId);
  return { pricing, config };
}

export async function createGiftCard(userId, payload) {
  const config = await getGiftCardSettings();
  if (!config.enabled) {
    throw new AppError("Gift cards are currently unavailable.", 503, "GIFT_CARDS_DISABLED");
  }

  const amount = Number(payload.amount);
  if (amount < config.minAmount || amount > config.maxAmount) {
    throw new AppError(
      `Amount must be between ₹${config.minAmount} and ₹${config.maxAmount}.`,
      400,
      "VALIDATION_ERROR",
    );
  }

  if (payload.message && payload.message.length > 500) {
    throw new AppError("Message cannot exceed 500 characters.", 400, "VALIDATION_ERROR");
  }

  const pricing = await calculatePricing(amount, payload.couponCode, userId);
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + Number(config.expiryMonths || 12));

  const scheduledAt =
    payload.deliveryType === "SCHEDULED" && payload.scheduledAt
      ? new Date(payload.scheduledAt)
      : null;

  if (scheduledAt && scheduledAt <= new Date()) {
    throw new AppError("Scheduled delivery must be in the future.", 400, "VALIDATION_ERROR");
  }

  const placeholderPinHash = createPlaceholderPinHash();
  const code = generateGiftCardCode();

  const giftCard = await prisma.$transaction(
    async (tx) => {
      const created = await createGiftCardWithUniqueCode(tx, {
        pinHash: placeholderPinHash,
        senderId: userId,
        senderName: payload.senderName?.trim() || "Anonymous",
        recipientName: payload.recipientName.trim(),
        recipientEmail: payload.recipientEmail.trim().toLowerCase(),
        recipientPhone: payload.recipientPhone?.trim() || null,
        amount: pricing.amount,
        remainingBalance: pricing.amount,
        message: payload.message?.trim() || null,
        occasion: payload.occasion || "Custom",
        theme: payload.theme || "luxury-black",
        deliveryMethod: payload.deliveryMethod || "EMAIL",
        deliveryType: payload.deliveryType || "INSTANT",
        scheduledAt,
        timezone: payload.timezone || "Asia/Kolkata",
        status: payload.deliveryType === "SCHEDULED" ? "SCHEDULED" : "PENDING_PAYMENT",
        paymentStatus: "PENDING",
        expiryDate,
        platformFee: pricing.platformFee,
        gstAmount: pricing.gstAmount,
        discountAmount: pricing.discountAmount,
        couponCode: pricing.couponApplied ? payload.couponCode?.toUpperCase() : null,
        grandTotal: pricing.grandTotal,
      }, { maxAttempts: 5 });

      await tx.giftCardActivityLog.create({
        data: {
          giftCardId: created.id,
          action: "CREATED",
          message: "Gift card purchase initiated",
        },
      });

      return created;
    },
    { maxWait: 5000, timeout: 8000 },
  );

  return {
    giftCard: mapGiftCard(giftCard),
    pricing,
  };
}

export async function payForGiftCard(userId, giftCardId, { paymentProvider = "MOCK" } = {}) {
  const card = await prisma.giftCard.findFirst({
    where: { id: giftCardId, senderId: userId },
  });

  if (!card) {
    throw new AppError("Gift card not found.", 404, "NOT_FOUND");
  }

  if (card.paymentStatus === "CAPTURED") {
    return { giftCard: mapGiftCard(card), alreadyPaid: true };
  }

  const provider = getPaymentProvider(paymentProvider);
  const intent = await provider.createIntent({
    amount: decimalToNumber(card.grandTotal),
    currency: card.currency,
    orderId: card.id,
    orderNumber: card.giftCardCode,
  });

  const capture = await provider.capturePayment({
    paymentIntentId: intent.providerRef,
    amount: decimalToNumber(card.grandTotal),
    currency: card.currency,
    orderNumber: card.giftCardCode,
  });

  if (card.couponCode) {
    await prisma.coupon.updateMany({
      where: { userId, code: card.couponCode, isUsed: false },
      data: { isUsed: true, usedAt: new Date() },
    });
  }

  const pin = generatePin();
  const pinHash = await hashPin(pin);

  const isScheduled = card.deliveryType === "SCHEDULED" && card.scheduledAt;
  const nextStatus = isScheduled ? "SCHEDULED" : "ACTIVE";

  const updated = await prisma.$transaction(
    async (tx) => {
      const result = await tx.giftCard.update({
        where: { id: card.id },
        data: {
          pinHash,
          paymentStatus: "CAPTURED",
          status: nextStatus,
          paymentProvider: paymentProvider,
          providerRef: capture.providerTxnId || intent.providerRef,
        },
      });

      await tx.giftCardActivityLog.create({
        data: {
          giftCardId: card.id,
          action: "PAYMENT_CAPTURED",
          message: `Payment captured via ${paymentProvider}`,
          metadata: { amount: decimalToNumber(card.grandTotal) },
        },
      });

      return result;
    },
    { maxWait: 5000, timeout: 8000 },
  );

  queuePostPurchaseSideEffects(
    userId,
    updated,
    pin,
    isScheduled,
    paymentProvider,
    decimalToNumber(card.grandTotal),
  );

  return {
    giftCard: mapGiftCard(updated, { includePin: true, pin }),
    payment: capture,
  };
}

export async function purchaseGiftCard(userId, payload, { paymentProvider = "MOCK" } = {}) {
  logger.info("Gift card purchase: validation starting", { userId });

  const config = await getGiftCardSettings();
  if (!config.enabled) {
    throw new AppError("Gift cards are currently unavailable.", 503, "GIFT_CARDS_DISABLED");
  }

  const amount = Number(payload.amount);
  if (amount < config.minAmount || amount > config.maxAmount) {
    throw new AppError(
      `Amount must be between ₹${config.minAmount} and ₹${config.maxAmount}.`,
      400,
      "VALIDATION_ERROR",
    );
  }

  if (payload.message && payload.message.length > 500) {
    throw new AppError("Message cannot exceed 500 characters.", 400, "VALIDATION_ERROR");
  }

  logger.info("Gift card purchase: validation passed", { userId, amount });

  const pricing = await calculatePricing(amount, payload.couponCode, userId);
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + Number(config.expiryMonths || 12));

  const scheduledAt =
    payload.deliveryType === "SCHEDULED" && payload.scheduledAt
      ? new Date(payload.scheduledAt)
      : null;

  if (scheduledAt && scheduledAt <= new Date()) {
    throw new AppError("Scheduled delivery must be in the future.", 400, "VALIDATION_ERROR");
  }

  const pin = generatePin();
  const pinHash = await hashPin(pin);
  const isScheduled = payload.deliveryType === "SCHEDULED" && scheduledAt;
  const nextStatus = isScheduled ? "SCHEDULED" : "ACTIVE";

  logger.info("Gift card purchase: payment starting", { userId, provider: paymentProvider, total: pricing.grandTotal });

  const provider = getPaymentProvider(paymentProvider);
  const intent = await provider.createIntent({
    amount: pricing.grandTotal,
    currency: "INR",
    orderId: "pending",
    orderNumber: "pending",
  });
  const capture = await provider.capturePayment({
    paymentIntentId: intent.providerRef,
    amount: pricing.grandTotal,
    currency: "INR",
    orderNumber: "pending",
  });

  logger.info("Gift card purchase: payment captured", { userId, txn: capture.providerTxnId });

  if (pricing.couponApplied && payload.couponCode) {
    await prisma.coupon.updateMany({
      where: { userId, code: payload.couponCode.toUpperCase(), isUsed: false },
      data: { isUsed: true, usedAt: new Date() },
    });
  }

  logger.info("Gift card purchase: saving to database", { userId });

  const card = await createGiftCardStandalone({
    pinHash,
    senderId: userId,
    senderName: payload.senderName?.trim() || "Anonymous",
    recipientName: payload.recipientName.trim(),
    recipientEmail: payload.recipientEmail.trim().toLowerCase(),
    recipientPhone: payload.recipientPhone?.trim() || null,
    amount: pricing.amount,
    remainingBalance: pricing.amount,
    message: payload.message?.trim() || null,
    occasion: payload.occasion || "Custom",
    theme: payload.theme || "luxury-black",
    deliveryMethod: payload.deliveryMethod || "EMAIL",
    deliveryType: payload.deliveryType || "INSTANT",
    scheduledAt,
    timezone: payload.timezone || "Asia/Kolkata",
    status: nextStatus,
    paymentStatus: "CAPTURED",
    paymentProvider,
    providerRef: capture.providerTxnId || intent.providerRef,
    expiryDate,
    platformFee: pricing.platformFee,
    gstAmount: pricing.gstAmount,
    discountAmount: pricing.discountAmount,
    couponCode: pricing.couponApplied ? payload.couponCode?.toUpperCase() : null,
    grandTotal: pricing.grandTotal,
  });

  logger.info("Gift card purchase: saved", { userId, giftCardId: card.id, code: card.giftCardCode });

  queuePostPurchaseSideEffects(
    userId,
    card,
    pin,
    isScheduled,
    paymentProvider,
    pricing.grandTotal,
  );

  return {
    giftCard: mapGiftCard(card, { includePin: true, pin }),
    payment: capture,
    pricing,
  };
}

export async function deliverGiftCard(giftCardId, plainPin = null) {
  const card = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!card) return null;

  let pin = plainPin;
  if (!pin) {
    pin = generatePin();
    const pinHash = await hashPin(pin);
    await prisma.giftCard.update({
      where: { id: giftCardId },
      data: { pinHash },
    });
  }

  try {
    await giftCardEmailService.sendRecipientGiftCard({ card, pin });
    await giftCardEmailService.sendSenderConfirmation({ card });
  } catch (error) {
    logger.warn("Gift card email delivery failed", { giftCardId, message: error.message });
  }

  const updated = await prisma.giftCard.update({
    where: { id: giftCardId },
    data: {
      status: card.status === "SCHEDULED" ? "ACTIVE" : card.status,
      emailSentAt: new Date(),
      deliveredAt: new Date(),
    },
  });

  await logActivity(giftCardId, "EMAIL_SENT", "Gift card delivered to recipient");

  const recipientUser = await prisma.user.findFirst({
    where: { email: card.recipientEmail.toLowerCase() },
    select: { id: true },
  });

  if (recipientUser) {
    try {
      await createUserNotification({
        userId: recipientUser.id,
        type: "GIFT_CARD_RECEIVED",
        title: "You received a gift card!",
        message: `${card.senderName} sent you a ₹${decimalToNumber(card.amount)} LIT gift card.`,
        entityType: "gift_card",
        entityId: card.id,
      });
    } catch (error) {
      logger.warn("Gift card recipient notification failed", {
        giftCardId: card.id,
        message: error.message,
      });
    }
  }

  return mapGiftCard(updated);
}

export async function redeemGiftCard(userId, { giftCardCode, pin }) {
  const code = normalizeGiftCardCode(giftCardCode);
  const card = await prisma.giftCard.findUnique({ where: { giftCardCode: code } });

  if (!card) {
    throw new AppError("Invalid gift card code.", 404, "INVALID_CODE");
  }

  if (card.status === "EXPIRED" || card.expiryDate < new Date()) {
    throw new AppError("This gift card has expired.", 410, "EXPIRED");
  }

  if (card.status === "CANCELLED") {
    throw new AppError("This gift card has been cancelled.", 410, "CANCELLED");
  }

  if (card.paymentStatus !== "CAPTURED") {
    throw new AppError("Gift card payment is not complete.", 409, "NOT_PAID");
  }

  if (card.status === "REDEEMED" || decimalToNumber(card.remainingBalance) <= 0) {
    throw new AppError("This gift card has already been fully redeemed.", 409, "ALREADY_REDEEMED");
  }

  const pinValid = await verifyPin(pin, card.pinHash);
  if (!pinValid) {
    throw new AppError("Invalid PIN.", 401, "INVALID_PIN");
  }

  const balance = decimalToNumber(card.remainingBalance);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { giftCardBalance: { increment: balance } },
    });

    await tx.giftCard.update({
      where: { id: card.id },
      data: {
        remainingBalance: 0,
        status: "REDEEMED",
        redeemedAt: new Date(),
        redeemedById: userId,
      },
    });

    await tx.giftCardActivityLog.create({
      data: {
        giftCardId: card.id,
        action: "REDEEMED",
        message: `Redeemed ₹${balance} to wallet`,
        metadata: { userId, balance },
      },
    });
  });

  if (card.senderId) {
    await createUserNotification({
      userId: card.senderId,
      type: "GIFT_CARD_REDEEMED",
      title: "Gift card redeemed",
      message: `Your gift card ${card.giftCardCode} was redeemed by ${card.recipientName}.`,
      entityType: "gift_card",
      entityId: card.id,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { giftCardBalance: true },
  });

  return {
    redeemedAmount: balance,
    giftCardBalance: decimalToNumber(user.giftCardBalance),
    giftCardCode: card.giftCardCode,
  };
}

export async function listUserGiftCards(userId) {
  const cards = await prisma.giftCard.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return cards.map((c) => mapGiftCard(c));
}

export async function getGiftCardById(userId, giftCardId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  const card = await prisma.giftCard.findFirst({
    where: {
      id: giftCardId,
      OR: [
        { senderId: userId },
        ...(user?.email
          ? [{ recipientEmail: { equals: user.email.toLowerCase(), mode: "insensitive" } }]
          : []),
      ],
    },
    include: { activityLogs: { orderBy: { createdAt: "asc" } } },
  });

  if (!card) {
    throw new AppError("Gift card not found.", 404, "NOT_FOUND");
  }

  return {
    ...mapGiftCard(card),
    activityLogs: card.activityLogs.map((log) => ({
      id: log.id,
      action: log.action,
      message: log.message,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

export async function resendGiftCardEmail(giftCardId, adminUserId) {
  const card = await prisma.giftCard.findUnique({ where: { id: giftCardId } });
  if (!card) throw new AppError("Gift card not found.", 404, "NOT_FOUND");

  const pin = generatePin();
  const pinHash = await hashPin(pin);
  await prisma.giftCard.update({ where: { id: giftCardId }, data: { pinHash } });
  await deliverGiftCard(giftCardId, pin);
  await logActivity(giftCardId, "EMAIL_RESENT", "Email resent by admin", { adminUserId });
  return { resent: true };
}

export async function processScheduledGiftCards() {
  const due = await prisma.giftCard.findMany({
    where: {
      status: "SCHEDULED",
      paymentStatus: "CAPTURED",
      scheduledAt: { lte: new Date() },
    },
    take: 50,
  });

  for (const card of due) {
    try {
      await deliverGiftCard(card.id);
      logger.info("Scheduled gift card delivered", { code: card.giftCardCode });
    } catch (error) {
      logger.error("Scheduled gift card delivery failed", {
        id: card.id,
        message: error.message,
      });
    }
  }

  return { processed: due.length };
}

export async function expireOldGiftCards() {
  const result = await prisma.giftCard.updateMany({
    where: {
      expiryDate: { lt: new Date() },
      status: { in: ["ACTIVE", "SCHEDULED", "PARTIALLY_REDEEMED"] },
    },
    data: { status: "EXPIRED" },
  });
  return result.count;
}

export default {
  getGiftCardConfig,
  previewGiftCardPurchase,
  createGiftCard,
  payForGiftCard,
  purchaseGiftCard,
  redeemGiftCard,
  listUserGiftCards,
  getGiftCardById,
  resendGiftCardEmail,
  processScheduledGiftCards,
  expireOldGiftCards,
};
