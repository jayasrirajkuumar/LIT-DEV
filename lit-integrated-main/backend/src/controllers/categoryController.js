import {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService.js";
import { auditLogService } from "../services/auditLogService.js";
import { AUDIT_ACTIONS } from "../constants/auditActions.js";

export async function getCategories(_req, res) {
  const categories = await listCategories();
  res.json({ success: true, data: { categories } });
}

export async function getCategory(req, res) {
  const category = await getCategoryBySlug(req.validatedParams.slug);
  res.json({ success: true, data: { category } });
}

export async function postCategory(req, res) {
  const category = await createCategory(req.validatedBody);
  if (req.dbUser) {
    await auditLogService.record({
      adminUserId: req.dbUser.id,
      action: AUDIT_ACTIONS.CATEGORY_CREATED,
      entityType: "category",
      entityId: category.id,
      metadata: { name: category.name },
    });
  }
  res.status(201).json({ success: true, data: { category } });
}

export async function patchCategory(req, res) {
  const category = await updateCategory(req.validatedParams.id, req.validatedBody);
  if (req.dbUser) {
    await auditLogService.record({
      adminUserId: req.dbUser.id,
      action: AUDIT_ACTIONS.CATEGORY_UPDATED,
      entityType: "category",
      entityId: category.id,
      metadata: { name: category.name },
    });
  }
  res.json({ success: true, data: { category } });
}

export async function removeCategory(req, res) {
  const category = await deleteCategory(req.validatedParams.id);
  if (req.dbUser) {
    await auditLogService.record({
      adminUserId: req.dbUser.id,
      action: AUDIT_ACTIONS.CATEGORY_DELETED,
      entityType: "category",
      entityId: req.validatedParams.id,
      metadata: { name: category?.name },
    });
  }
  res.json({ success: true, data: { category } });
}

export default {
  getCategories,
  getCategory,
  postCategory,
  patchCategory,
  removeCategory,
};
