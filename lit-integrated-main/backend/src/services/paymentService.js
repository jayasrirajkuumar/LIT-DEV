import { getPaymentProvider } from "./payments/paymentProviderFactory.js";
import { RazorpayPaymentProvider } from "./payments/razorpayPaymentProvider.js";
import { logger } from "../utils/logger.js";
import config from "../config/env.js";

function decimalToNumber(value) {
  return Number(value?.toString?.() ?? value ?? 0);
}

export async function createPaymentOrder(userId, { amount, purpose = "gift_card", metadata = {} }) {
  const value = Number(amount);
  if (!value || value <= 0) {
    throw new AppError("Invalid payment amount.", 400, "VALIDATION_ERROR");
  }

  const razorpay = new RazorpayPaymentProvider();
  if (!razorpay.isConfigured()) {
    const mock = getPaymentProvider("MOCK");
    const intent = await mock.createIntent({
      amount: value,
      currency: "INR",
      orderId: userId,
      orderNumber: `mock_${Date.now()}`,
      notes: { purpose, ...metadata },
    });
    return {
      provider: "MOCK",
      orderId: intent.providerRef,
      amount: value,
      currency: "INR",
      keyId: null,
      mock: true,
    };
  }

  const intent = await razorpay.createIntent({
    amount: value,
    currency: "INR",
    orderId: userId,
    orderNumber: `${purpose}_${Date.now()}`,
    notes: { purpose, userId, ...metadata },
  });

  logger.info("Razorpay order created", { userId, orderId: intent.providerRef, amount: value });

  return {
    provider: "RAZORPAY",
    orderId: intent.providerRef,
    amount: value,
    currency: "INR",
    keyId: razorpay.getPublicKey(),
    mock: false,
  };
}

export async function verifyRazorpayPayment(userId, {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError("Missing Razorpay payment verification fields.", 400, "VALIDATION_ERROR");
  }

  const razorpay = new RazorpayPaymentProvider();
  if (!razorpay.isConfigured()) {
    throw new AppError("Razorpay is not configured.", 503, "RAZORPAY_NOT_CONFIGURED");
  }

  const valid = razorpay.verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    throw new AppError("Invalid Razorpay payment signature.", 400, "PAYMENT_VERIFICATION_FAILED");
  }

  logger.info("Razorpay payment verified", { userId, paymentId: razorpay_payment_id });

  return {
    verified: true,
    amount: null,
    providerRef: razorpay_payment_id,
    orderId: razorpay_order_id,
  };
}

export function getPaymentConfig() {
  const razorpay = new RazorpayPaymentProvider();
  return {
    razorpayEnabled: razorpay.isConfigured(),
    razorpayKeyId: razorpay.isConfigured() ? razorpay.getPublicKey() : null,
    mockEnabled: !config.isProduction,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  };
}

export default { createPaymentOrder, verifyRazorpayPayment, getPaymentConfig };
