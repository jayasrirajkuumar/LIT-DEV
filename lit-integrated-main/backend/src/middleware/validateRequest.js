import { z } from "zod";

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      return next({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid request body.",
        details: result.error.flatten(),
      });
    }

    req.validatedBody = result.data;
    next();
  };
}

export function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params ?? {});

    if (!result.success) {
      return next({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Invalid route parameters.",
        details: result.error.flatten(),
      });
    }

    req.validatedParams = result.data;
    next();
  };
}

export const syncUserBodySchema = z.object({
  idToken: z.string().min(1).optional(),
});

export const updateProfileBodySchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required.").max(255),
    phoneNumber: z
      .string()
      .trim()
      .max(20)
      .optional()
      .nullable()
      .transform((value) => value || null),
    profilePicture: z
      .string()
      .trim()
      .url("Profile picture must be a valid URL.")
      .max(2048)
      .optional()
      .nullable()
      .transform((value) => value || null),
  })
  .strict();

export const addressTypeSchema = z.enum(["HOME", "OFFICE", "OTHER"]);

export const createAddressBodySchema = z
  .object({
    fullName: z.string().trim().min(1).max(255),
    phone: z.string().trim().min(1).max(20),
    addressLine1: z.string().trim().min(1).max(255),
    addressLine2: z
      .string()
      .trim()
      .max(255)
      .optional()
      .nullable()
      .transform((value) => value || null),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),
    country: z.string().trim().min(1).max(100),
    addressType: addressTypeSchema,
    isDefault: z.boolean().optional().default(false),
  })
  .strict();

export const updateAddressBodySchema = z
  .object({
    fullName: z.string().trim().min(1).max(255).optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    addressLine1: z.string().trim().min(1).max(255).optional(),
    addressLine2: z
      .string()
      .trim()
      .max(255)
      .optional()
      .nullable()
      .transform((value) => (value === undefined ? undefined : value || null)),
    city: z.string().trim().min(1).max(100).optional(),
    state: z.string().trim().min(1).max(100).optional(),
    postalCode: z.string().trim().min(1).max(20).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    addressType: addressTypeSchema.optional(),
    isDefault: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const addressIdParamSchema = z.object({
  id: z.string().uuid("Address id must be a valid UUID."),
});

export default validateBody;
