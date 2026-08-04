import { prisma } from "../database/prismaClient.js";
import { storeSettingsService } from "./storeSettingsService.js";
import { adminNotificationService } from "./adminNotificationService.js";

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length).toUpperCase();
}

export async function getWelcomeCouponSettings() {
  const settings = await storeSettingsService.get();
  return settings.welcomeCoupon ?? {
    enabled: true,
    amount: 500,
    expiryDays: 30,
    prefix: "WELCOME",
  };
}

export async function issueWelcomeCoupon(userId) {
  const config = await getWelcomeCouponSettings();
  if (!config.enabled) return null;

  const existing = await prisma.coupon.findFirst({
    where: { userId, source: "WELCOME" },
  });
  if (existing) return existing;

  const amount = Number(config.amount ?? 500);
  const expiryDays = Number(config.expiryDays ?? 30);
  const prefix = String(config.prefix ?? "WELCOME").toUpperCase();
  const code = `${prefix}-${randomSuffix(6)}`;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  const coupon = await prisma.coupon.create({
    data: {
      userId,
      code,
      type: "FLAT",
      amount,
      source: "WELCOME",
      expiresAt,
    },
  });

  return coupon;
}

export async function listUserCoupons(userId) {
  const coupons = await prisma.coupon.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    amount: Number(c.amount),
    isUsed: c.isUsed,
    source: c.source,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    usedAt: c.usedAt?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
}

export default {
  issueWelcomeCoupon,
  listUserCoupons,
  getWelcomeCouponSettings,
};
