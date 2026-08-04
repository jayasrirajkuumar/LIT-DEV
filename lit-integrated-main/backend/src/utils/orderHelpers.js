const SHIPPING_RATES = {
  STANDARD: 99,
  EXPRESS: 199,
};

const DELIVERY_ESTIMATES = {
  STANDARD: "5–7 business days",
  EXPRESS: "2–3 business days",
};

const TAX_RATE = 0.18;

export function getShippingCharge(deliveryMethod = "STANDARD") {
  return SHIPPING_RATES[deliveryMethod] ?? SHIPPING_RATES.STANDARD;
}

export function getDeliveryEstimate(deliveryMethod = "STANDARD") {
  return DELIVERY_ESTIMATES[deliveryMethod] ?? DELIVERY_ESTIMATES.STANDARD;
}

export function calculateOrderTotals({ itemsSubtotal, deliveryMethod = "STANDARD", discount = 0 }) {
  const subtotal = roundMoney(itemsSubtotal);
  const shippingCharge = roundMoney(getShippingCharge(deliveryMethod));
  const taxable = Math.max(subtotal - discount, 0);
  const tax = roundMoney(taxable * TAX_RATE);
  const grandTotal = roundMoney(taxable + shippingCharge + tax);

  return {
    subtotal,
    shippingCharge,
    tax,
    discount: roundMoney(discount),
    grandTotal,
    deliveryEstimate: getDeliveryEstimate(deliveryMethod),
  };
}

export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

export function generateOrderNumber() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `LIT-${ymd}-${suffix}`;
}

export function mapOrderStatusLabel(status) {
  const labels = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    PACKED: "Packed",
    SHIPPED: "Shipped",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    RETURNED: "Returned",
    REFUNDED: "Refunded",
  };
  return labels[status] ?? status;
}

export default {
  getShippingCharge,
  getDeliveryEstimate,
  calculateOrderTotals,
  roundMoney,
  generateOrderNumber,
  mapOrderStatusLabel,
};
