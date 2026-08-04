import { PrismaClient } from "@prisma/client";
import { SEED_CATEGORIES, buildSeedProducts } from "./seedData.js";

const prisma = new PrismaClient();

async function upsertCategory(category) {
  return prisma.category.upsert({
    where: { slug: category.slug },
    update: {
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: true,
      displayOrder: category.displayOrder,
    },
    create: {
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: true,
      displayOrder: category.displayOrder,
    },
  });
}

async function upsertProduct(product, categoryId) {
  const saved = await prisma.product.upsert({
    where: { sku: product.sku },
    update: {
      categoryId,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      brand: product.brand,
      price: product.price,
      comparePrice: product.comparePrice,
      currency: "INR",
      status: product.status,
      weight: product.weight,
      dimensions: product.dimensions,
      isFeatured: product.isFeatured,
    },
    create: {
      categoryId,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      sku: product.sku,
      brand: product.brand,
      price: product.price,
      comparePrice: product.comparePrice,
      currency: "INR",
      status: product.status,
      weight: product.weight,
      dimensions: product.dimensions,
      isFeatured: product.isFeatured,
    },
  });

  await prisma.productInventory.upsert({
    where: { productId: saved.id },
    update: {
      quantity: product.inventory.quantity,
      reservedQuantity: product.inventory.reservedQuantity,
      lowStockThreshold: product.inventory.lowStockThreshold,
    },
    create: {
      productId: saved.id,
      quantity: product.inventory.quantity,
      reservedQuantity: product.inventory.reservedQuantity,
      lowStockThreshold: product.inventory.lowStockThreshold,
    },
  });

  await prisma.productImage.deleteMany({ where: { productId: saved.id } });

  if (product.images.length > 0) {
    await prisma.productImage.createMany({
      data: product.images.map((image) => ({
        productId: saved.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
    });
  }

  return saved;
}

async function main() {
  console.log("Seeding LIT luxury marketplace...");

  const categoryMap = new Map();

  for (const category of SEED_CATEGORIES) {
    const saved = await upsertCategory(category);
    categoryMap.set(category.slug, saved.id);
    console.log(`  ✓ Category: ${saved.name}`);
  }

  const products = buildSeedProducts();
  let productCount = 0;

  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      console.warn(`  ⚠ Skipping product ${product.sku} — category missing`);
      continue;
    }

    await upsertProduct(product, categoryId);
    productCount += 1;
  }

  console.log(`  ✓ Products seeded: ${productCount}`);
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
