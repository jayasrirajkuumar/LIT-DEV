-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('FLAT', 'PERCENT');
CREATE TYPE "CouponSource" AS ENUM ('WELCOME', 'ADMIN', 'PROMOTION');

-- CreateTable
CREATE TABLE "marketplace_announcements" (
    "id" UUID NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "marketplace_announcements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(1024),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "marketplace_brands_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_sort_options" (
    "id" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "label" VARCHAR(128) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "marketplace_sort_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketplace_filter_options" (
    "id" UUID NOT NULL,
    "key" VARCHAR(64) NOT NULL,
    "label" VARCHAR(128) NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'select',
    "config" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "marketplace_filter_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "coupons" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "type" "CouponType" NOT NULL DEFAULT 'FLAT',
    "amount" DECIMAL(12,2) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "source" "CouponSource" NOT NULL DEFAULT 'WELCOME',
    "expires_at" TIMESTAMPTZ(6),
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_request_replies" (
    "id" UUID NOT NULL,
    "support_request_id" UUID NOT NULL,
    "admin_user_id" UUID,
    "message" TEXT NOT NULL,
    "channel" VARCHAR(32) NOT NULL DEFAULT 'EMAIL',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_request_replies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "marketplace_brands_slug_key" ON "marketplace_brands"("slug");
CREATE UNIQUE INDEX "marketplace_sort_options_key_key" ON "marketplace_sort_options"("key");
CREATE UNIQUE INDEX "marketplace_filter_options_key_key" ON "marketplace_filter_options"("key");
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE INDEX "idx_marketplace_announcements_active" ON "marketplace_announcements"("is_active", "sort_order");
CREATE INDEX "idx_marketplace_brands_active" ON "marketplace_brands"("is_active", "sort_order");
CREATE INDEX "idx_marketplace_sort_options_active" ON "marketplace_sort_options"("is_active", "sort_order");
CREATE INDEX "idx_marketplace_filter_options_active" ON "marketplace_filter_options"("is_active", "sort_order");
CREATE INDEX "idx_coupons_user_used" ON "coupons"("user_id", "is_used");
CREATE INDEX "idx_support_replies_request" ON "support_request_replies"("support_request_id", "created_at");

ALTER TABLE "coupons" ADD CONSTRAINT "coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_request_replies" ADD CONSTRAINT "support_request_replies_support_request_id_fkey" FOREIGN KEY ("support_request_id") REFERENCES "support_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_request_replies" ADD CONSTRAINT "support_request_replies_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default announcements
INSERT INTO "marketplace_announcements" ("id", "message", "sort_order", "is_active", "updated_at") VALUES
  (gen_random_uuid(), 'Free Shipping Above ₹2999', 0, true, NOW()),
  (gen_random_uuid(), 'New Luxury Collection', 1, true, NOW()),
  (gen_random_uuid(), 'Flat 10% OFF for New Users', 2, true, NOW()),
  (gen_random_uuid(), 'Secure Payments', 3, true, NOW()),
  (gen_random_uuid(), 'Easy Returns', 4, true, NOW());

-- Seed default sort options
INSERT INTO "marketplace_sort_options" ("id", "key", "label", "sort_order", "is_active", "updated_at") VALUES
  (gen_random_uuid(), 'newest', 'Newest', 0, true, NOW()),
  (gen_random_uuid(), 'popularity', 'Popularity', 1, true, NOW()),
  (gen_random_uuid(), 'price_asc', 'Price Low to High', 2, true, NOW()),
  (gen_random_uuid(), 'price_desc', 'Price High to Low', 3, true, NOW()),
  (gen_random_uuid(), 'discount', 'Discount', 4, true, NOW()),
  (gen_random_uuid(), 'featured', 'Featured', 5, true, NOW());

-- Seed default filter options
INSERT INTO "marketplace_filter_options" ("id", "key", "label", "type", "sort_order", "is_active", "updated_at") VALUES
  (gen_random_uuid(), 'category', 'Category', 'select', 0, true, NOW()),
  (gen_random_uuid(), 'brand', 'Brand', 'search', 1, true, NOW()),
  (gen_random_uuid(), 'gender', 'Gender', 'select', 2, true, NOW()),
  (gen_random_uuid(), 'kids', 'Kids', 'toggle', 3, true, NOW()),
  (gen_random_uuid(), 'color', 'Color', 'select', 4, true, NOW()),
  (gen_random_uuid(), 'size', 'Size', 'select', 5, true, NOW()),
  (gen_random_uuid(), 'price_range', 'Price Range', 'range', 6, true, NOW()),
  (gen_random_uuid(), 'discount', 'Discount', 'select', 7, true, NOW()),
  (gen_random_uuid(), 'availability', 'Availability', 'select', 8, true, NOW()),
  (gen_random_uuid(), 'rating', 'Rating', 'select', 9, true, NOW()),
  (gen_random_uuid(), 'material', 'Material', 'select', 10, true, NOW()),
  (gen_random_uuid(), 'collections', 'Collections', 'select', 11, true, NOW());
