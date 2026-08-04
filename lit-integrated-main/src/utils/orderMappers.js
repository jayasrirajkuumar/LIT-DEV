function mapDisplayStatus(orderStatus) {
  if (["SHIPPED", "OUT_FOR_DELIVERY", "PROCESSING", "PACKED", "CONFIRMED"].includes(orderStatus)) {
    return "On the Way";
  }
  if (orderStatus === "DELIVERED") return "Delivered";
  if (orderStatus === "CANCELLED") return "Canceled";
  if (orderStatus === "RETURNED" || orderStatus === "REFUNDED") return "Returned";
  return "Pending";
}

export function mapApiOrderToUi(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    status: mapDisplayStatus(order.orderStatus),
    rawStatus: order.orderStatus,
    orderTimestamp: order.createdAt,
    estimatedDelivery: order.deliveryEstimate,
    trackingNumber: order.trackingNumber,
    shippingInfo: {
      recipientName: order.shippingAddress?.fullName || "—",
      address: order.shippingAddress?.formatted?.replace(/\n/g, ", ") || "—",
      contactInfo: order.shippingAddress?.phone || "—",
    },
    items: (order.items ?? []).map((item) => ({
      sku: item.sku,
      name: item.name,
      brand: item.brand || "LIT",
      quantity: item.quantity,
      priceAtPurchase: Number(item.price),
      price: Number(item.price),
      image: item.image || "/placeholder-product.png",
    })),
    pricing: {
      subtotal: Number(order.pricing?.subtotal ?? order.subtotal),
      shippingFee: Number(order.pricing?.shippingFee ?? order.shippingCharge),
      discount: Number(order.pricing?.discount ?? order.discount),
      tax: Number(order.pricing?.tax ?? order.tax),
      grandTotal: Number(order.pricing?.grandTotal ?? order.grandTotal),
    },
    deliveryStatus: (order.statusHistory ?? [])
      .slice()
      .reverse()
      .map((entry) => ({
        title: entry.statusLabel || entry.status,
        date: new Date(entry.createdAt).toLocaleString(),
        icon: "✅",
        active: true,
      })),
    paymentStatus: order.paymentStatus,
    canCancel: order.canCancel ?? false,
    cancelWindowExpired: order.cancelWindowExpired ?? false,
    cancelWindowMinutes: order.cancelWindowMinutes ?? 30,
    cancellationReason: order.cancellationReason ?? null,
    statusHistory: order.statusHistory ?? [],
    customer: order.customer,
    adminNotes: order.adminNotes,
  };
}

export default { mapApiOrderToUi, mapDisplayStatus };
