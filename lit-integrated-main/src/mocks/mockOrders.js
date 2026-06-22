// NOTE: This data is now leaner and only references product SKUs.
export const mockOrders = [
  {
    id: "A1B2-C3D4-E5F6",
    date: "October 26, 2023",
    status: "Delivered",
    estimatedDelivery: null,
    orderTimestamp: "2023-10-26T10:30:00Z",
    shippingInfo: {
      recipientName: "Jane Doe",
      address: "123 Tech Lane, Silicon Valley, CA 94043",
      contactInfo: "jane.doe@example.com",
    },
    items: [{ sku: "LW-CP-001", quantity: 1, priceAtPurchase: 499.99 }],
    pricing: {
      subtotal: 499.99,
      shippingFee: 0.0,
      discount: 50.0,
      tax: 37.12,
      grandTotal: 487.11,
    },
    deliveryStatus: [
      {
        title: "Delivered",
        date: "Oct 26, 2023, 11:05 AM",
        icon: "🟢",
        active: true,
      },
      {
        title: "Out for Delivery",
        date: "Oct 26, 2023, 08:15 AM",
        icon: "📦",
        active: true,
      },
      {
        title: "Shipped",
        date: "Oct 25, 2023, 04:20 PM",
        icon: "🚚",
        active: true,
      },
      {
        title: "Packed",
        date: "Oct 25, 2023, 09:00 AM",
        icon: "✅",
        active: true,
      },
      {
        title: "Order Placed",
        date: "Oct 24, 2023, 06:45 PM",
        icon: "✅",
        active: true,
      },
    ],
  },
  {
    id: "G7H8-I9J0-K1L2",
    date: "November 15, 2023",
    status: "On the Way",
    estimatedDelivery: "November 20, 2023",
    shippingInfo: {
      recipientName: "John Smith",
      address: "456 Innovation Ave, Austin, TX 78701",
      contactInfo: "john.smith@example.com",
    },
    items: [
      { sku: "AP-NCH-005", quantity: 1, priceAtPurchase: 299.0 },
      { sku: "AP-HTC-002", quantity: 1, priceAtPurchase: 25.0 },
    ],
    pricing: {
      subtotal: 324.0,
      shippingFee: 5.99,
      discount: 0.0,
      tax: 26.4,
      grandTotal: 356.39,
    },
    deliveryStatus: [
      {
        title: "Shipped",
        date: "Nov 16, 2023, 09:30 AM",
        icon: "🚚",
        active: true,
      },
      {
        title: "Packed",
        date: "Nov 15, 2023, 08:00 PM",
        icon: "✅",
        active: true,
      },
      {
        title: "Order Placed",
        date: "Nov 15, 2023, 02:00 PM",
        icon: "✅",
        active: true,
      },
    ],
  },
];
