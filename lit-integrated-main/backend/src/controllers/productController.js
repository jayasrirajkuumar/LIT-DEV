import {
  listProducts,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getProductsByCategorySlug,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService.js";
import { auditLogService } from "../services/auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

export async function getProducts(req, res) {
  const result = await listProducts(req.validatedQuery);
  res.json({ success: true, data: result });
}

export async function searchProductsHandler(req, res) {
  const result = await searchProducts(req.validatedQuery);
  res.json({ success: true, data: result });
}

export async function getFeatured(req, res) {
  const result = await getFeaturedProducts(req.validatedQuery.limit);
  res.json({ success: true, data: result });
}

export async function getNewArrivalsHandler(req, res) {
  const result = await getNewArrivals(req.validatedQuery.limit);
  res.json({ success: true, data: result });
}

export async function getProductsByCategory(req, res) {
  const result = await getProductsByCategorySlug(
    req.validatedParams.slug,
    req.validatedQuery,
  );
  res.json({ success: true, data: result });
}

export async function getProduct(req, res) {
  const product = await getProductBySlug(req.validatedParams.slug);
  res.json({ success: true, data: { product } });
}

export async function postProduct(req, res) {
  const product = await createProduct(req.validatedBody);
  if (req.dbUser) {
    await auditLogService.record({
      adminUserId: req.dbUser.id,
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      entityType: "product",
      entityId: product.id,
      metadata: { name: product.name, sku: product.sku },
    });
  }
  res.status(201).json({ success: true, data: { product } });
}

export async function patchProduct(req, res) {
  const product = await updateProduct(req.validatedParams.id, req.validatedBody);
  if (req.dbUser) {
    await auditLogService.record({
      adminUserId: req.dbUser.id,
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      entityType: "product",
      entityId: product.id,
      metadata: { name: product.name },
    });
  }
  res.json({ success: true, data: { product } });
}

export async function removeProduct(req, res) {
  const product = await deleteProduct(req.validatedParams.id);
  if (req.dbUser) {
    await auditLogService.record({
      adminUserId: req.dbUser.id,
      action: AUDIT_ACTIONS.PRODUCT_DELETED,
      entityType: "product",
      entityId: req.validatedParams.id,
      metadata: { name: product?.name },
    });
  }
  res.json({ success: true, data: { product } });
}

export default {
  getProducts,
  searchProductsHandler,
  getFeatured,
  getNewArrivalsHandler,
  getProductsByCategory,
  getProduct,
  postProduct,
  patchProduct,
  removeProduct,
};
