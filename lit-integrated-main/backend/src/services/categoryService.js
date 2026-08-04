import { AppError } from "../utils/AppError.js";
import { categoryRepository } from "../repositories/categoryRepository.js";
import { toPublicCategory } from "../utils/catalogMappers.js";
import slugify from "../utils/slugify.js";

export async function listCategories() {
  return categoryRepository.findAllActive();
}

export async function getCategoryBySlug(slug) {
  const category = await categoryRepository.findBySlug(slug, { activeOnly: true });

  if (!category) {
    throw new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  return toPublicCategory(category, { includeProductCount: true });
}

export async function createCategory(data) {
  const slug = data.slug || slugify(data.name);

  const existing = await categoryRepository.findBySlugExact(slug);
  if (existing) {
    throw new AppError("Category slug already exists.", 409, "SLUG_ALREADY_EXISTS");
  }

  return categoryRepository.create({
    name: data.name,
    slug,
    description: data.description ?? null,
    imageUrl: data.imageUrl ?? null,
    isActive: data.isActive ?? true,
    displayOrder: data.displayOrder ?? 0,
  });
}

export async function updateCategory(id, data) {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  if (data.slug && data.slug !== category.slug) {
    const existing = await categoryRepository.findBySlugExact(data.slug);
    if (existing) {
      throw new AppError("Category slug already exists.", 409, "SLUG_ALREADY_EXISTS");
    }
  }

  return categoryRepository.update(id, {
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.slug !== undefined ? { slug: data.slug } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
  });
}

export async function deleteCategory(id) {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Category not found.", 404, "CATEGORY_NOT_FOUND");
  }

  const productCount = await categoryRepository.countProducts(id);
  if (productCount > 0) {
    throw new AppError(
      "Cannot delete category with existing products.",
      409,
      "CATEGORY_HAS_PRODUCTS",
    );
  }

  return categoryRepository.delete(id);
}

export default {
  listCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
