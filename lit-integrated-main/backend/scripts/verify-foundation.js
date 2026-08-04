#!/usr/bin/env node
/**
 * Verifies Phase 1 foundation before Phase 2 deployment.
 * Run: node scripts/verify-foundation.js
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

dotenv.config({ path: resolve(root, ".env") });

const checks = [];

function pass(name, detail) {
  checks.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? `: ${detail}` : ""}`);
}

function fail(name, detail) {
  checks.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? `: ${detail}` : ""}`);
}

const schemaPath = resolve(root, "prisma/schema.prisma");
if (existsSync(schemaPath)) {
  pass("Prisma schema exists", schemaPath);
} else {
  fail("Prisma schema exists");
}

const initMigration = resolve(
  root,
  "prisma/migrations/20250623000000_init_users/migration.sql",
);
if (existsSync(initMigration)) {
  pass("Init users migration present");
} else {
  fail("Init users migration present");
}

const phase2Migration = resolve(
  root,
  "prisma/migrations/20250623100000_add_phone_and_addresses/migration.sql",
);
if (existsSync(phase2Migration)) {
  pass("Phase 2 migration present");
} else {
  fail("Phase 2 migration present");
}

if (!process.env.DATABASE_URL) {
  fail("DATABASE_URL configured", "Copy .env.example to .env");
} else {
  pass("DATABASE_URL configured");

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    pass("Database connection");

    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'addresses', 'categories', 'products', 'product_images', 'product_inventory', '_prisma_migrations')
    `;

    const tableNames = tables.map((row) => row.table_name);

    if (tableNames.includes("users")) {
      pass("users table exists");
    } else {
      fail("users table exists", "Run npm run prisma:migrate:deploy");
    }

    if (tableNames.includes("addresses")) {
      pass("addresses table exists");
    } else {
      fail("addresses table exists", "Apply Phase 2 migration");
    }

    if (tableNames.includes("categories")) {
      pass("categories table exists");
    } else {
      fail("categories table exists", "Apply Phase 3 migration");
    }

    if (tableNames.includes("products")) {
      pass("products table exists");
    } else {
      fail("products table exists", "Apply Phase 3 migration");
    }

    const userColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    const columns = userColumns.map((row) => row.column_name);

    if (columns.includes("phone_number")) {
      pass("users.phone_number column exists");
    } else {
      fail("users.phone_number column exists");
    }
  } catch (error) {
    fail("Database connection", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

const failed = checks.filter((check) => !check.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);

if (failed.length > 0) {
  process.exit(1);
}
