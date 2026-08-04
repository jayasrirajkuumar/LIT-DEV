import { z } from "zod";

const uuidParam = z.string().uuid();

export const productIdParamSchema = z.object({
  productId: uuidParam,
});

export const addCartItemBodySchema = z.object({
  productId: uuidParam,
  quantity: z.coerce.number().int().min(1).max(99).optional().default(1),
});

export const updateCartItemBodySchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

export const moveItemBodySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99).optional().default(1),
});

export const collectionIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const createCollectionBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const updateCollectionBodySchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const collectionItemBodySchema = z.object({
  collectionId: z.string().uuid().optional(),
});

export const moveCollectionItemBodySchema = z.object({
  targetCollectionId: z.string().uuid(),
});

export default {
  productIdParamSchema,
  addCartItemBodySchema,
  updateCartItemBodySchema,
  moveItemBodySchema,
  collectionIdParamSchema,
  createCollectionBodySchema,
  updateCollectionBodySchema,
  collectionItemBodySchema,
  moveCollectionItemBodySchema,
};
