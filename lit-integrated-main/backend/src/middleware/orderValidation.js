import { z } from "zod";

export const deliveryMethodSchema = z.enum(["STANDARD", "EXPRESS"]);

const buyNowItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

const checkoutModeSchema = z.enum(["cart", "buy_now"]).optional();

export const checkoutPreviewQuerySchema = z
  .object({
    deliveryMethod: deliveryMethodSchema.optional(),
    addressId: z.string().uuid().optional(),
    couponCode: z.string().trim().max(64).optional(),
    checkoutMode: checkoutModeSchema,
    productId: z.string().uuid().optional(),
    quantity: z.coerce.number().int().positive().max(99).optional(),
  })
  .refine(
    (data) => data.checkoutMode !== "buy_now" || Boolean(data.productId),
    { message: "productId is required for buy_now checkout." },
  );

export const shippingAddressBodySchema = z.object({
  fullName: z.string().trim().min(1).max(255),
  phone: z.string().trim().min(1).max(20),
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(1).max(100),
});

export const checkoutBodySchema = z.object({
  addressId: z.string().uuid().optional(),
  deliveryMethod: deliveryMethodSchema.optional(),
  couponCode: z.string().trim().max(64).optional().nullable(),
  giftMessage: z.string().trim().max(500).optional().nullable(),
  orderNotes: z.string().trim().max(1000).optional().nullable(),
});

export const createOrderBodySchema = z
  .object({
    addressId: z.string().uuid().optional(),
    shippingAddress: shippingAddressBodySchema.optional(),
    deliveryMethod: deliveryMethodSchema.default("STANDARD"),
    paymentProvider: z.enum(["MOCK", "RAZORPAY", "STRIPE"]).default("MOCK"),
    paymentMethod: z.string().trim().max(50).default("mock_card"),
    couponCode: z.string().trim().max(64).optional().nullable(),
    giftMessage: z.string().trim().max(500).optional().nullable(),
    orderNotes: z.string().trim().max(1000).optional().nullable(),
    checkoutMode: z.enum(["cart", "buy_now"]).default("cart"),
    buyNow: buyNowItemSchema.optional(),
  })
  .refine((data) => data.checkoutMode !== "buy_now" || Boolean(data.buyNow?.productId), {
    message: "buyNow.productId is required when checkoutMode is buy_now.",
  })
  .refine((data) => data.addressId || data.shippingAddress, {
    message: "Either addressId or shippingAddress is required.",
  });

export const orderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const orderListQuerySchema = z.object({
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
      "REFUNDED",
    ])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "AUTHORIZED", "CAPTURED", "FAILED", "REFUNDED", "CANCELLED"])
    .optional(),
  search: z.string().trim().max(64).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.enum(["newest", "oldest", "total_desc", "total_asc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const cancelOrderBodySchema = z
  .object({
    reasonCode: z
      .enum([
        "CHANGED_MIND",
        "BETTER_PRICE",
        "ORDERED_BY_MISTAKE",
        "DELIVERY_TOO_SLOW",
        "PAYMENT_ISSUE",
        "DIFFERENT_PRODUCT",
        "OTHER",
      ])
      .optional(),
    reasonText: z.string().trim().max(1000).optional().nullable(),
    reason: z.string().trim().max(500).optional().nullable(),
  })
  .refine(
    (data) => data.reasonCode !== "OTHER" || Boolean(data.reasonText?.trim() || data.reason?.trim()),
    { message: "reasonText is required when reasonCode is OTHER." },
  );

export const adminUpdateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ]),
  note: z.string().trim().max(500).optional().nullable(),
});

export const adminTrackingSchema = z.object({
  trackingNumber: z.string().trim().min(1).max(128),
});

export const adminNotesSchema = z.object({
  adminNotes: z.string().trim().max(5000),
});

export default {
  checkoutPreviewQuerySchema,
  createOrderBodySchema,
  orderIdParamSchema,
  orderListQuerySchema,
  cancelOrderBodySchema,
  adminUpdateStatusSchema,
  adminTrackingSchema,
  adminNotesSchema,
};
