import { prisma } from "../database/prismaClient.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

function decimalToNumber(value) {
  return Number(value?.toString?.() ?? value ?? 0);
}

function mapWallet(wallet) {
  return {
    id: wallet.id,
    userId: wallet.userId,
    walletBalance: decimalToNumber(wallet.walletBalance),
    totalCredits: decimalToNumber(wallet.totalCredits),
    totalDebits: decimalToNumber(wallet.totalDebits),
    isFrozen: wallet.isFrozen,
    createdAt: wallet.createdAt.toISOString(),
    updatedAt: wallet.updatedAt.toISOString(),
  };
}

function mapTransaction(tx) {
  return {
    id: tx.id,
    type: tx.type,
    amount: decimalToNumber(tx.amount),
    balanceAfter: decimalToNumber(tx.balanceAfter),
    referenceType: tx.referenceType,
    referenceId: tx.referenceId,
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
  };
}

export async function ensureWallet(userId, { tx } = {}) {
  const client = tx ?? prisma;
  let wallet = await client.wallet.findUnique({ where: { userId } });
  if (wallet) return wallet;

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { giftCardBalance: true },
  });

  wallet = await client.wallet.create({
    data: {
      userId,
      walletBalance: user?.giftCardBalance ?? 0,
      totalCredits: user?.giftCardBalance ?? 0,
      totalDebits: 0,
    },
  });

  logger.info("Wallet created for user", { userId, walletId: wallet.id });
  return wallet;
}

export async function getWallet(userId) {
  const wallet = await ensureWallet(userId);
  return mapWallet(wallet);
}

export async function getWalletHistory(userId, { limit = 50, page = 1 } = {}) {
  await ensureWallet(userId);
  const take = Math.min(limit, 100);
  const skip = (Math.max(page, 1) - 1) * take;

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.walletTransaction.count({ where: { userId } }),
  ]);

  return {
    transactions: transactions.map(mapTransaction),
    pagination: { page, limit: take, total },
  };
}

async function applyWalletMutation(userId, { type, amount, direction, description, referenceType, referenceId, metadata }, outerTx) {
  const client = outerTx ?? prisma;
  const value = Math.abs(Number(amount));
  if (value <= 0) throw new AppError("Amount must be positive.", 400, "VALIDATION_ERROR");

  const wallet = await ensureWallet(userId, { tx: client });
  if (wallet.isFrozen) {
    throw new AppError("Wallet is frozen. Contact support.", 403, "WALLET_FROZEN");
  }

  const current = decimalToNumber(wallet.walletBalance);
  const next = direction === "credit" ? current + value : current - value;

  if (direction === "debit" && next < 0) {
    throw new AppError("Insufficient wallet balance.", 400, "INSUFFICIENT_BALANCE");
  }

  const updated = await client.wallet.update({
    where: { id: wallet.id },
    data: {
      walletBalance: next,
      ...(direction === "credit"
        ? { totalCredits: { increment: value } }
        : { totalDebits: { increment: value } }),
    },
  });

  await client.user.update({
    where: { id: userId },
    data: { giftCardBalance: next },
  });

  const transaction = await client.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId,
      type,
      amount: value,
      balanceAfter: next,
      referenceType,
      referenceId,
      description,
      metadata,
    },
  });

  return { wallet: updated, transaction };
}

export async function creditWallet(userId, options, outerTx) {
  return applyWalletMutation(userId, { ...options, direction: "credit" }, outerTx);
}

export async function debitWallet(userId, options, outerTx) {
  return applyWalletMutation(userId, { ...options, direction: "debit" }, outerTx);
}

export async function payWithWallet(userId, amount, description, reference) {
  return prisma.$transaction(async (tx) => {
    const result = await debitWallet(
      userId,
      {
        type: "PAYMENT",
        amount,
        description,
        referenceType: reference?.type ?? "payment",
        referenceId: reference?.id ?? null,
        metadata: reference?.metadata ?? null,
      },
      tx,
    );
    return mapWallet(result.wallet);
  });
}

export async function addMoneyToWallet(userId, amount, { description = "Wallet top-up", reference } = {}) {
  return prisma.$transaction(async (tx) => {
    const result = await creditWallet(
      userId,
      {
        type: "TOP_UP",
        amount,
        description,
        referenceType: reference?.type ?? "top_up",
        referenceId: reference?.id ?? null,
      },
      tx,
    );
    return mapWallet(result.wallet);
  });
}

export async function adminRefundWallet(userId, amount, adminUserId, reason) {
  return prisma.$transaction(async (tx) => {
    const result = await creditWallet(
      userId,
      {
        type: "REFUND",
        amount,
        description: reason || "Admin wallet refund",
        referenceType: "admin_refund",
        referenceId: adminUserId,
      },
      tx,
    );
    return mapWallet(result.wallet);
  });
}

export async function getAdminWalletAnalytics() {
  const [aggregate, walletCount, frozenCount] = await Promise.all([
    prisma.wallet.aggregate({
      _sum: { walletBalance: true, totalCredits: true, totalDebits: true },
    }),
    prisma.wallet.count(),
    prisma.wallet.count({ where: { isFrozen: true } }),
  ]);

  return {
    totalWalletBalance: decimalToNumber(aggregate._sum.walletBalance),
    totalCredits: decimalToNumber(aggregate._sum.totalCredits),
    totalDebits: decimalToNumber(aggregate._sum.totalDebits),
    walletCount,
    frozenCount,
  };
}

export async function listAdminWallets({ search, page = 1, limit = 20 } = {}) {
  const take = Math.min(limit, 100);
  const skip = (Math.max(page, 1) - 1) * take;
  const where = search
    ? {
        user: {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { displayName: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search } },
          ],
        },
      }
    : {};

  const [wallets, total] = await Promise.all([
    prisma.wallet.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, displayName: true, phoneNumber: true } },
      },
      orderBy: { walletBalance: "desc" },
      take,
      skip,
    }),
    prisma.wallet.count({ where }),
  ]);

  return {
    wallets: wallets.map((w) => ({
      ...mapWallet(w),
      user: {
        id: w.user.id,
        email: w.user.email,
        displayName: w.user.displayName,
        phoneNumber: w.user.phoneNumber,
      },
    })),
    pagination: { page, limit: take, total },
  };
}

export default {
  ensureWallet,
  getWallet,
  getWalletHistory,
  creditWallet,
  debitWallet,
  payWithWallet,
  addMoneyToWallet,
  adminRefundWallet,
  getAdminWalletAnalytics,
  listAdminWallets,
};
