-- Phase 7.4: Wishlist collections, order cancellation reasons, support requests

CREATE TYPE "CancellationReasonCode" AS ENUM (
  'CHANGED_MIND',
  'BETTER_PRICE',
  'ORDERED_BY_MISTAKE',
  'DELIVERY_TOO_SLOW',
  'PAYMENT_ISSUE',
  'DIFFERENT_PRODUCT',
  'OTHER'
);

CREATE TYPE "SupportRequestType" AS ENUM ('GENERAL', 'ORDER', 'RETURN', 'SHIPPING', 'PAYMENT', 'CHAT');
CREATE TYPE "SupportRequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE "wishlist_collections" (
    "id" UUID NOT NULL,
    "wishlist_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "wishlist_collections_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "wishlist_items" ADD COLUMN "collection_id" UUID;

INSERT INTO "wishlist_collections" ("id", "wishlist_id", "name", "slug", "is_default", "display_order", "created_at", "updated_at")
SELECT gen_random_uuid(), w."id", 'Favorites', 'favorites', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "wishlists" w;

UPDATE "wishlist_items" wi
SET "collection_id" = wc."id"
FROM "wishlist_collections" wc
WHERE wc."wishlist_id" = wi."wishlist_id" AND wc."is_default" = true;

ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "wishlist_items_wishlist_id_fkey";
ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "uq_wishlist_items_wishlist_product";
DROP INDEX IF EXISTS "idx_wishlist_items_wishlist_id";
ALTER TABLE "wishlist_items" DROP COLUMN "wishlist_id";

ALTER TABLE "wishlist_items" ALTER COLUMN "collection_id" SET NOT NULL;

CREATE UNIQUE INDEX "uq_wishlist_items_collection_product" ON "wishlist_items"("collection_id", "product_id");
CREATE INDEX "idx_wishlist_items_collection_id" ON "wishlist_items"("collection_id");
CREATE UNIQUE INDEX "uq_wishlist_collections_wishlist_slug" ON "wishlist_collections"("wishlist_id", "slug");
CREATE INDEX "idx_wishlist_collections_order" ON "wishlist_collections"("wishlist_id", "display_order");

ALTER TABLE "wishlist_collections" ADD CONSTRAINT "wishlist_collections_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "wishlist_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "order_cancellation_reasons" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "reason_code" "CancellationReasonCode" NOT NULL,
    "reason_text" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_cancellation_reasons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "order_cancellation_reasons_order_id_key" ON "order_cancellation_reasons"("order_id");
CREATE INDEX "idx_order_cancellation_reason_code" ON "order_cancellation_reasons"("reason_code");

ALTER TABLE "order_cancellation_reasons" ADD CONSTRAINT "order_cancellation_reasons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "support_requests" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "type" "SupportRequestType" NOT NULL,
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" "SupportRequestStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_support_requests_user_created" ON "support_requests"("user_id", "created_at");
CREATE INDEX "idx_support_requests_status" ON "support_requests"("status");

ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
