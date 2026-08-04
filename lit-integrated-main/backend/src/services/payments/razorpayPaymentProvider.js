import crypto from "crypto";
import { PaymentProviderAdapter } from "./PaymentProviderAdapter.js";
import config from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

function getRazorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return { keyId, keySecret, configured: Boolean(keyId && keySecret) };
}

async function razorpayFetch(path, options = {}) {
  const { keyId, keySecret } = getRazorpayKeys();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new AppError(
      payload?.error?.description || "Razorpay request failed.",
      502,
      "RAZORPAY_ERROR",
      payload,
    );
  }
  return payload;
}

export class RazorpayPaymentProvider extends PaymentProviderAdapter {
  constructor() {
    super("RAZORPAY");
  }

  isConfigured() {
    return getRazorpayKeys().configured;
  }

  getPublicKey() {
    return getRazorpayKeys().keyId ?? null;
  }

  async createIntent({ amount, currency = "INR", orderId, orderNumber, receipt, notes = {} }) {
    if (!this.isConfigured()) {
      throw new AppError("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.", 503, "RAZORPAY_NOT_CONFIGURED");
    }

    const order = await razorpayFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency,
        receipt: receipt || orderNumber || orderId || `lit_${Date.now()}`,
        notes: { orderId, orderNumber, ...notes },
      }),
    });

    return {
      provider: "RAZORPAY",
      providerRef: order.id,
      amount: Number(amount),
      currency,
      keyId: getRazorpayKeys().keyId,
      metadata: { order },
    };
  }

  async capturePayment({ paymentIntentId, amount, currency, orderNumber }) {
    if (!this.isConfigured()) {
      throw new AppError("Razorpay is not configured.", 503, "RAZORPAY_NOT_CONFIGURED");
    }
    return {
      provider: "RAZORPAY",
      providerTxnId: paymentIntentId,
      amount,
      currency,
      status: "CAPTURED",
      metadata: { orderNumber },
    };
  }

  verifyPaymentSignature({ orderId, paymentId, signature }) {
    const { keySecret } = getRazorpayKeys();
    if (!keySecret) return false;
    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

export default RazorpayPaymentProvider;
