import { prisma } from "../database/prismaClient.js";
import { toPublicCategory } from "../utils/catalogMappers.js";

export const categoryRepository = {
  async findAllActive() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return categories.map((category) => toPublicCategory(category));
  },

  async findAllAdmin() {
    const categories = await prisma.category.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: true } } },
    });

    return categories.map((category) =>
      toPublicCategory(category, { includeProductCount: true }),
    );
  },

  async findBySlug(slug, { activeOnly = true } = {}) {
    return prisma.category.findFirst({
      where: {
        slug,
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        _count: { select: { products: true } },
      },
    });
  },

  async findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  },

  async findBySlugExact(slug) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async create(data) {
    const category = await prisma.category.create({ data });
    return toPublicCategory(category);
  },

  async update(id, data) {
    const category = await prisma.category.update({ where: { id }, data });
    return toPublicCategory(category);
  },

  async delete(id) {
    const category = await prisma.category.delete({ where: { id } });
    return toPublicCategory(category);
  },

  async countProducts(categoryId) {
    return prisma.product.count({ where: { categoryId } });
  },
};

export default categoryRepository;
