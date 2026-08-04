import { z } from "zod";
import { validateBody, validateParams } from "./validateRequest.js";

export { validateBody, validateParams };

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query ?? {});

    if (!result.success) {
      return next({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters.",
        details: result.error.flatten(),
      });
    }

    req.validatedQuery = result.data;
    next();
  };
}

const slugParam = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format.");

const uuidParam = z.string().uuid("Id must be a valid UUID.");

const productStatusSchema = z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK", "ARCHIVED"]);

const dimensionsSchema = z
  .object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
    unit: z.string().trim().max(10).optional(),
  })
  .strict()
  .optional()
  .nullable();

const productImageSchema = z.object({
  imageUrl: z.string().trim().url().max(2048),
  altText: z.string().trim().max(255).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

const inventoryInputSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  reservedQuantity: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const categorySlugParamSchema = z.object({
  slug: slugParam,
});

export const categoryIdParamSchema = z.object({
  id: uuidParam,
});

export const productSlugParamSchema = z.object({
  slug: slugParam,
});

export const productIdParamSchema = z.object({
  id: uuidParam,
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: slugParam.optional(),
  brand: z.string().trim().min(1).max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  availability: z.enum(["all", "in_stock", "out_of_stock", "low_stock"]).optional().default("all"),
  sort: z.enum(["newest", "price_asc", "price_desc", "popularity"]).optional().default("newest"),
});

export const productSearchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required.").max(255),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  category: slugParam.optional(),
  brand: z.string().trim().min(1).max(255).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  availability: z.enum(["all", "in_stock", "out_of_stock", "low_stock"]).optional().default("all"),
  sort: z.enum(["newest", "price_asc", "price_desc", "popularity"]).optional().default("newest"),
});

export const listLimitQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
});

export const createCategoryBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    slug: slugParam.optional(),
    description: z.string().trim().max(5000).optional().nullable(),
    imageUrl: z.string().trim().url().max(2048).optional().nullable(),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().int().min(0).optional().default(0),
  })
  .strict();

export const updateCategoryBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    slug: slugParam.optional(),
    description: z.string().trim().max(5000).optional().nullable(),
    imageUrl: z.string().trim().url().max(2048).optional().nullable(),
    isActive: z.boolean().optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const createProductBodySchema = z
  .object({
    categoryId: uuidParam,
    name: z.string().trim().min(1).max(255),
    slug: slugParam.optional(),
    shortDescription: z.string().trim().max(500).optional().nullable(),
    description: z.string().trim().max(20000).optional().nullable(),
    sku: z.string().trim().min(1).max(64),
    brand: z.string().trim().min(1).max(255),
    price: z.coerce.number().positive(),
    comparePrice: z.coerce.number().positive().optional().nullable(),
    currency: z.string().trim().length(3).optional().default("INR"),
    status: productStatusSchema.optional().default("DRAFT"),
    weight: z.coerce.number().positive().optional().nullable(),
    dimensions: dimensionsSchema,
    isFeatured: z.boolean().optional().default(false),
    inventory: inventoryInputSchema.optional().default({}),
    images: z.array(productImageSchema).max(20).optional().default([]),
  })
  .strict();

export const updateProductBodySchema = z
  .object({
    categoryId: uuidParam.optional(),
    name: z.string().trim().min(1).max(255).optional(),
    slug: slugParam.optional(),
    shortDescription: z.string().trim().max(500).optional().nullable(),
    description: z.string().trim().max(20000).optional().nullable(),
    sku: z.string().trim().min(1).max(64).optional(),
    brand: z.string().trim().min(1).max(255).optional(),
    price: z.coerce.number().positive().optional(),
    comparePrice: z.coerce.number().positive().optional().nullable(),
    currency: z.string().trim().length(3).optional(),
    status: productStatusSchema.optional(),
    weight: z.coerce.number().positive().optional().nullable(),
    dimensions: dimensionsSchema,
    isFeatured: z.boolean().optional(),
    inventory: inventoryInputSchema.optional(),
    images: z.array(productImageSchema).max(20).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export default {
  validateQuery,
};
