import { mapOrderStatusLabel } from "./orderHelpers.js";
import { getOrderCancelEligibility } from "./orderCancelHelpers.js";

function decimalToString(value) {
  return value?.toString?.() ?? String(value ?? "0");
}

export function toPublicOrderItem(item) {
  return {
    id: item.id,
    productId: item.productId,
    name: item.productNameSnapshot,
    sku: item.skuSnapshot,
    price: decimalToString(item.priceSnapshot),
    quantity: item.quantity,
    subtotal: decimalToString(item.subtotal),
    image: item.product?.images?.[0]?.imageUrl ?? null,
    brand: item.product?.brand ?? null,
  };
}

export function toPublicShippingAddress(address) {
  if (!address) return null;
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    formatted: [
      address.addressLine1,
      address.addressLine2,
      [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
      address.country,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export function toPublicStatusHistory(entry) {
  return {
    id: entry.id,
    status: entry.status,
    statusLabel: mapOrderStatusLabel(entry.status),
    note: entry.note,
    changedBy: entry.changedBy,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function toPublicPaymentIntent(intent) {
  return {
    id: intent.id,
    provider: intent.provider,
    amount: decimalToString(intent.amount),
    currency: intent.currency,
    status: intent.status,
    providerRef: intent.providerRef,
    createdAt: intent.createdAt.toISOString(),
    updatedAt: intent.updatedAt.toISOString(),
    transactions: (intent.transactions ?? []).map((txn) => ({
      id: txn.id,
      provider: txn.provider,
      status: txn.status,
      amount: decimalToString(txn.amount),
      currency: txn.currency,
      providerTxnId: txn.providerTxnId,
      createdAt: txn.createdAt.toISOString(),
    })),
  };
}

export function toPublicOrder(order, options = {}) {
  const { includePayment = true, includeAdmin = false } = options;
  const cancelEligibility = getOrderCancelEligibility(order);

  const base = {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    subtotal: decimalToString(order.subtotal),
    shippingCharge: decimalToString(order.shippingCharge),
    tax: decimalToString(order.tax),
    discount: decimalToString(order.discount),
    grandTotal: decimalToString(order.grandTotal),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    orderStatusLabel: mapOrderStatusLabel(order.orderStatus),
    paymentMethod: order.paymentMethod,
    currency: order.currency,
    deliveryMethod: order.deliveryMethod,
    deliveryEstimate: order.deliveryEstimate,
    couponCode: order.couponCode,
    giftMessage: order.giftMessage,
    orderNotes: order.orderNotes,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: (order.items ?? []).map(toPublicOrderItem),
    shippingAddress: toPublicShippingAddress(order.shippingAddress),
    statusHistory: (order.statusHistory ?? []).map(toPublicStatusHistory),
    cancellationReason: order.cancellationReason
      ? {
          reasonCode: order.cancellationReason.reasonCode,
          reasonText: order.cancellationReason.reasonText,
          createdAt: order.cancellationReason.createdAt.toISOString(),
        }
      : null,
    canCancel: cancelEligibility.canCancel,
    cancelWindowExpired: cancelEligibility.cancelWindowExpired,
    cancelWindowMinutes: cancelEligibility.cancelWindowMinutes,
    pricing: {
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingCharge),
      discount: Number(order.discount),
      tax: Number(order.tax),
      grandTotal: Number(order.grandTotal),
    },
  };

  if (includePayment) {
    base.paymentIntents = (order.paymentIntents ?? []).map(toPublicPaymentIntent);
  }

  if (includeAdmin) {
    base.adminNotes = order.adminNotes;
    base.customer = order.user
      ? {
          id: order.user.id,
          email: order.user.email,
          displayName: order.user.displayName,
          phoneNumber: order.user.phoneNumber,
        }
      : undefined;
  }

  return base;
}

export default {
  toPublicOrder,
  toPublicOrderItem,
  toPublicShippingAddress,
  toPublicStatusHistory,
  toPublicPaymentIntent,
};
