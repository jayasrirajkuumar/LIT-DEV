import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { generateGiftCardCode } from "../utils/giftCardHelpers.js";
import { storeSettingsService } from "./storeSettingsService.js";
import { debitWallet, creditWallet, ensureWallet } from "./walletService.js";
import { verifyRazorpayPayment } from "./paymentService.js";
import { getPaymentProvider } from "./payments/paymentProviderFactory.js";
import { giftCardEmailService } from "./giftCardEmailService.js";
import { createUserNotification } from "./customerNotificationService.js";
import { logger } from "../utils/logger.js";

function decimalToNumber(value) {
  return Number(value?.toString?.() ?? value ?? 0);
}

async function getGiftCardSettings() {
  const settings = await storeSettingsService.get();
  return settings.giftCards ?? {
    enabled: true,
    minAmount: 100,
    maxAmount: 50000,
    expiryMonths: 12,
    platformFeePercent: 0,
    gstPercent: 18,
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
    if (coupon) discount = decimalToNumber(coupon.amount);
  }

  const platformFee = (baseAmount * Number(config.platformFeePercent || 0)) / 100;
  const taxable = Math.max(0, baseAmount - discount);
  const gstAmount = (taxable * Number(config.gstPercent || 18)) / 100;
  const grandTotal = Math.max(0, taxable + platformFee + gstAmount);

  return { amount: baseAmount, platformFee, gstAmount, discountAmount: discount, grandTotal, couponApplied: discount > 0 };
}

function mapInternalGiftCard(card) {
  return {
    id: card.id,
    giftCardCode: card.giftCardCode,
    senderId: card.senderId,
    recipientId: card.recipientId,
    senderName: card.senderName,
    recipientName: card.recipientName,
    amount: decimalToNumber(card.amount),
    message: card.message,
    occasion: card.occasion,
    theme: card.theme,
    status: card.status,
    claimStatus: card.claimStatus,
    paymentStatus: card.paymentStatus,
    paymentProvider: card.paymentProvider,
    claimedAt: card.claimedAt?.toISOString() ?? null,
    declinedAt: card.declinedAt?.toISOString() ?? null,
    expiryDate: card.expiryDate.toISOString(),
    createdAt: card.createdAt.toISOString(),
    sender: card.sender
      ? { id: card.sender.id, displayName: card.sender.displayName, profilePicture: card.sender.profilePicture, username: card.sender.username }
      : null,
    recipient: card.recipient
      ? { id: card.recipient.id, displayName: card.recipient.displayName, profilePicture: card.recipient.profilePicture, phoneNumber: card.recipient.phoneNumber, username: card.recipient.username }
      : null,
  };
}

export async function searchLitUsers(query, { excludeUserId, limit = 10 } = {}) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      OR: [
        { displayName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phoneNumber: { contains: q } },
        { username: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      displayName: true,
      email: true,
      phoneNumber: true,
      profilePicture: true,
      username: true,
    },
    take: Math.min(limit, 20),
    orderBy: { displayName: "asc" },
  });

  return users.map((u) => ({
    id: u.id,
    displayName: u.displayName || u.email.split("@")[0],
    email: u.email,
    phoneNumber: u.phoneNumber,
    profilePicture: u.profilePicture,
    username: u.username,
  }));
}

async function validateRecipient(recipientId, senderId) {
  if (!recipientId) throw new AppError("Recipient is required.", 400, "VALIDATION_ERROR");
  if (recipientId === senderId) throw new AppError("You cannot send a gift card to yourself.", 400, "VALIDATION_ERROR");

  const recipient = await prisma.user.findFirst({
    where: { id: recipientId, isActive: true },
    select: { id: true, email: true, displayName: true, phoneNumber: true, profilePicture: true, username: true },
  });

  if (!recipient) throw new AppError("Recipient must be a registered LIT user.", 404, "USER_NOT_FOUND");
  return recipient;
}

async function createInternalGiftCardRecord(senderId, payload, pricing, payment) {
  const config = await getGiftCardSettings();
  const recipient = await validateRecipient(payload.recipientId, senderId);
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { displayName: true, email: true },
  });

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + Number(config.expiryMonths || 12));

  let code;
  let card;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    code = generateGiftCardCode();
    try {
      card = await prisma.giftCard.create({
        data: {
          giftCardCode: code,
          senderId,
          recipientId: recipient.id,
          senderName: payload.senderName?.trim() || sender?.displayName || "LIT Member",
          recipientName: recipient.displayName || recipient.email.split("@")[0],
          recipientEmail: recipient.email,
          recipientPhone: recipient.phoneNumber,
          amount: pricing.amount,
          remainingBalance: pricing.amount,
          message: payload.message?.trim() || null,
          occasion: payload.occasion || "Custom",
          theme: payload.theme || "luxury-black",
          deliveryMethod: "EMAIL",
          deliveryType: "INSTANT",
          status: "DELIVERED",
          claimStatus: "PENDING",
          paymentStatus: "CAPTURED",
          isInternal: true,
          paymentProvider: payment.provider,
          providerRef: payment.providerRef,
          expiryDate,
          platformFee: pricing.platformFee,
          gstAmount: pricing.gstAmount,
          discountAmount: pricing.discountAmount,
          couponCode: pricing.couponApplied ? payload.couponCode?.toUpperCase() : null,
          grandTotal: pricing.grandTotal,
          deliveredAt: new Date(),
        },
        include: {
          sender: { select: { id: true, displayName: true, profilePicture: true, username: true } },
          recipient: { select: { id: true, displayName: true, profilePicture: true, phoneNumber: true, username: true } },
        },
      });
      break;
    } catch (error) {
      if (error?.code === "P2002" && attempt < 4) continue;
      throw error;
    }
  }

  await prisma.giftCardTransaction.create({
    data: {
      giftCardId: card.id,
      userId: senderId,
      type: "PURCHASE",
      amount: pricing.grandTotal,
      paymentProvider: payment.provider,
      providerRef: payment.providerRef,
    },
  });

  await prisma.giftCardActivityLog.create({
    data: {
      giftCardId: card.id,
      action: "DELIVERED",
      message: `Internal gift card sent to ${recipient.displayName}`,
    },
  });

  return card;
}

async function notifyGiftReceived(card, senderName) {
  const amount = decimalToNumber(card.amount);
  const preview = card.message ? `${card.message} Tap to claim your gift.` : "Tap to claim your gift.";

  await createUserNotification({
    userId: card.recipientId,
    type: "GIFT_CARD_RECEIVED",
    title: `${senderName} sent you a gift`,
    message: `🎁 ${senderName} sent you a ₹${amount.toLocaleString("en-IN")} Gift Card. ${preview}`,
    entityType: "gift_card",
    entityId: card.id,
    metadata: { amount, senderName, giftCardId: card.id },
  });

  try {
    await giftCardEmailService.sendInternalGiftCardReceived({ card, senderName });
  } catch (error) {
    logger.warn("Gift card email failed", { giftCardId: card.id, message: error.message });
  }
}

export async function purchaseInternalGiftCard(senderId, payload) {
  const config = await getGiftCardSettings();
  if (!config.enabled) throw new AppError("Gift cards are currently unavailable.", 503, "GIFT_CARDS_DISABLED");

  const amount = Number(payload.amount);
  if (amount < config.minAmount || amount > config.maxAmount) {
    throw new AppError(`Amount must be between ₹${config.minAmount} and ₹${config.maxAmount}.`, 400, "VALIDATION_ERROR");
  }

  await validateRecipient(payload.recipientId, senderId);
  const pricing = await calculatePricing(amount, payload.couponCode, senderId);
  const paymentMethod = (payload.paymentMethod || "WALLET").toUpperCase();

  let payment = { provider: "WALLET", providerRef: null };

  if (paymentMethod === "WALLET") {
    await prisma.$transaction(async (tx) => {
      await debitWallet(
        senderId,
        {
          type: "GIFT_SENT",
          amount: pricing.grandTotal,
          description: `Gift card purchase for ₹${pricing.amount}`,
          referenceType: "gift_card_purchase",
        },
        tx,
      );
    });
    payment = { provider: "WALLET", providerRef: `wallet_${Date.now()}` };
  } else if (paymentMethod === "RAZORPAY") {
    const verification = await verifyRazorpayPayment(senderId, {
      razorpay_order_id: payload.razorpay_order_id,
      razorpay_payment_id: payload.razorpay_payment_id,
      razorpay_signature: payload.razorpay_signature,
    });
    payment = { provider: "RAZORPAY", providerRef: verification.providerRef };
  } else if (paymentMethod === "MOCK") {
    const mock = getPaymentProvider("MOCK");
    const intent = await mock.createIntent({ amount: pricing.grandTotal, currency: "INR", orderId: senderId, orderNumber: "gift" });
    const capture = await mock.capturePayment({ paymentIntentId: intent.providerRef, amount: pricing.grandTotal, currency: "INR" });
    payment = { provider: "MOCK", providerRef: capture.providerTxnId };
  } else {
    throw new AppError("Unsupported payment method.", 400, "VALIDATION_ERROR");
  }

  const card = await createInternalGiftCardRecord(senderId, payload, pricing, payment);
  await notifyGiftReceived(card, card.senderName);

  await createUserNotification({
    userId: senderId,
    type: "GIFT_CARD_SENT",
    title: "Gift card sent",
    message: `✅ Gift card sent successfully to ${card.recipientName}.`,
    entityType: "gift_card",
    entityId: card.id,
  });

  logger.info("Internal gift card purchased", { senderId, giftCardId: card.id, recipientId: card.recipientId });

  return { giftCard: mapInternalGiftCard(card), pricing, payment };
}

export async function claimInternalGiftCard(userId, giftCardId) {
  const card = await prisma.giftCard.findFirst({
    where: { id: giftCardId, recipientId: userId, isInternal: true },
    include: {
      sender: { select: { id: true, displayName: true, profilePicture: true, username: true } },
      recipient: { select: { id: true, displayName: true, profilePicture: true, phoneNumber: true, username: true } },
    },
  });

  if (!card) throw new AppError("Gift card not found.", 404, "NOT_FOUND");
  if (card.claimStatus === "CLAIMED") throw new AppError("Gift card already claimed.", 409, "ALREADY_CLAIMED");
  if (card.claimStatus === "DECLINED") throw new AppError("Gift card was declined.", 410, "DECLINED");
  if (card.status === "EXPIRED" || card.expiryDate < new Date()) throw new AppError("Gift card has expired.", 410, "EXPIRED");

  const balance = decimalToNumber(card.amount);

  await prisma.$transaction(async (tx) => {
    const updated = await tx.giftCard.updateMany({
      where: { id: card.id, claimStatus: "PENDING" },
      data: {
        claimStatus: "CLAIMED",
        status: "REDEEMED",
        remainingBalance: 0,
        claimedAt: new Date(),
        redeemedAt: new Date(),
        redeemedById: userId,
      },
    });

    if (updated.count !== 1) throw new AppError("Gift card already claimed.", 409, "ALREADY_CLAIMED");

    const credit = await creditWallet(
      userId,
      {
        type: "GIFT_RECEIVED",
        amount: balance,
        description: `Gift card received from ${card.senderName}`,
        referenceType: "gift_card",
        referenceId: card.id,
      },
      tx,
    );

    await tx.giftCardTransaction.create({
      data: {
        giftCardId: card.id,
        userId,
        type: "CLAIM",
        amount: balance,
        walletTransactionId: credit.transaction.id,
      },
    });

    await tx.giftCardActivityLog.create({
      data: { giftCardId: card.id, action: "CLAIMED", message: `₹${balance} credited to wallet` },
    });
  });

  if (card.senderId) {
    await createUserNotification({
      userId: card.senderId,
      type: "GIFT_CARD_CLAIMED",
      title: "Gift card claimed",
      message: `🎉 ${card.recipientName} claimed your ₹${balance.toLocaleString("en-IN")} Gift Card.`,
      entityType: "gift_card",
      entityId: card.id,
    });
  }

  await createUserNotification({
    userId,
    type: "WALLET_CREDITED",
    title: "Wallet credited",
    message: `₹${balance} added to your wallet from gift card.`,
    entityType: "gift_card",
    entityId: card.id,
  });

  const wallet = await ensureWallet(userId);
  return {
    claimedAmount: balance,
    walletBalance: decimalToNumber(wallet.walletBalance),
    giftCardId: card.id,
  };
}

export async function declineInternalGiftCard(userId, giftCardId) {
  const card = await prisma.giftCard.findFirst({
    where: { id: giftCardId, recipientId: userId, isInternal: true, claimStatus: "PENDING" },
  });
  if (!card) throw new AppError("Gift card not found or already processed.", 404, "NOT_FOUND");

  await prisma.$transaction(async (tx) => {
    await tx.giftCard.update({
      where: { id: card.id },
      data: { claimStatus: "DECLINED", status: "DECLINED", declinedAt: new Date() },
    });

    if (card.senderId) {
      await creditWallet(
        card.senderId,
        {
          type: "GIFT_REFUND",
          amount: decimalToNumber(card.grandTotal),
          description: `Refund for declined gift card to ${card.recipientName}`,
          referenceType: "gift_card",
          referenceId: card.id,
        },
        tx,
      );
    }

    await tx.giftCardTransaction.create({
      data: { giftCardId: card.id, userId, type: "DECLINE", amount: decimalToNumber(card.amount) },
    });
  });

  if (card.senderId) {
    await createUserNotification({
      userId: card.senderId,
      type: "GIFT_CARD_DECLINED",
      title: "Gift card declined",
      message: `❌ ${card.recipientName} declined your Gift Card. Amount refunded to your wallet.`,
      entityType: "gift_card",
      entityId: card.id,
    });
  }

  return { declined: true, giftCardId: card.id };
}

export async function listSentGiftCards(userId) {
  const cards = await prisma.giftCard.findMany({
    where: { senderId: userId, isInternal: true },
    include: {
      recipient: { select: { id: true, displayName: true, profilePicture: true, phoneNumber: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return cards.map(mapInternalGiftCard);
}

export async function listReceivedGiftCards(userId) {
  const cards = await prisma.giftCard.findMany({
    where: { recipientId: userId, isInternal: true },
    include: {
      sender: { select: { id: true, displayName: true, profilePicture: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return cards.map(mapInternalGiftCard);
}

export async function getInternalGiftCard(userId, giftCardId) {
  const card = await prisma.giftCard.findFirst({
    where: {
      id: giftCardId,
      isInternal: true,
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    include: {
      sender: { select: { id: true, displayName: true, profilePicture: true, username: true } },
      recipient: { select: { id: true, displayName: true, profilePicture: true, phoneNumber: true, username: true } },
    },
  });
  if (!card) throw new AppError("Gift card not found.", 404, "NOT_FOUND");
  return mapInternalGiftCard(card);
}

export default {
  searchLitUsers,
  purchaseInternalGiftCard,
  claimInternalGiftCard,
  declineInternalGiftCard,
  listSentGiftCards,
  listReceivedGiftCards,
  getInternalGiftCard,
};
