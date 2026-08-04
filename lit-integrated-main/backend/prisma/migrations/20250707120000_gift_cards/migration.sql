-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gift_card_balance" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING_PAYMENT', 'SCHEDULED', 'ACTIVE', 'PARTIALLY_REDEEMED', 'REDEEMED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "GiftCardDeliveryMethod" AS ENUM ('EMAIL', 'SMS', 'BOTH');
CREATE TYPE "GiftCardDeliveryType" AS ENUM ('INSTANT', 'SCHEDULED');

-- CreateTable
CREATE TABLE "gift_cards" (
  "id" UUID NOT NULL,
  "gift_card_code" VARCHAR(24) NOT NULL,
  "pin_hash" VARCHAR(128) NOT NULL,
  "sender_id" UUID,
  "sender_name" VARCHAR(255) NOT NULL,
  "recipient_name" VARCHAR(255) NOT NULL,
  "recipient_email" VARCHAR(320) NOT NULL,
  "recipient_phone" VARCHAR(20),
  "amount" DECIMAL(12,2) NOT NULL,
  "remaining_balance" DECIMAL(12,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
  "message" TEXT,
  "occasion" VARCHAR(64) NOT NULL,
  "theme" VARCHAR(64) NOT NULL,
  "delivery_method" "GiftCardDeliveryMethod" NOT NULL,
  "delivery_type" "GiftCardDeliveryType" NOT NULL,
  "scheduled_at" TIMESTAMPTZ(6),
  "timezone" VARCHAR(64),
  "status" "GiftCardStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "redeemed_at" TIMESTAMPTZ(6),
  "redeemed_by" UUID,
  "expiry_date" TIMESTAMPTZ(6) NOT NULL,
  "qr_code_data" TEXT,
  "platform_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "gst_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "coupon_code" VARCHAR(64),
  "grand_total" DECIMAL(12,2) NOT NULL,
  "payment_provider" "PaymentProvider",
  "provider_ref" VARCHAR(255),
  "email_sent_at" TIMESTAMPTZ(6),
  "delivered_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "gift_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gift_card_activity_logs" (
  "id" UUID NOT NULL,
  "gift_card_id" UUID NOT NULL,
  "action" VARCHAR(64) NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gift_card_activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gift_card_templates" (
  "id" UUID NOT NULL,
  "slug" VARCHAR(64) NOT NULL,
  "name" VARCHAR(128) NOT NULL,
  "image_url" TEXT,
  "gradient" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "gift_card_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gift_cards_gift_card_code_key" ON "gift_cards"("gift_card_code");
CREATE INDEX "idx_gift_cards_recipient_email" ON "gift_cards"("recipient_email");
CREATE INDEX "idx_gift_cards_status" ON "gift_cards"("status");
CREATE INDEX "idx_gift_cards_sender_created" ON "gift_cards"("sender_id", "created_at");
CREATE INDEX "idx_gift_cards_scheduled" ON "gift_cards"("scheduled_at", "status");
CREATE INDEX "idx_gift_card_activity" ON "gift_card_activity_logs"("gift_card_id", "created_at");
CREATE UNIQUE INDEX "gift_card_templates_slug_key" ON "gift_card_templates"("slug");
CREATE INDEX "idx_gift_card_templates_active" ON "gift_card_templates"("is_active", "sort_order");

ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_redeemed_by_fkey" FOREIGN KEY ("redeemed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "gift_card_activity_logs" ADD CONSTRAINT "gift_card_activity_logs_gift_card_id_fkey" FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "gift_card_templates" ("id", "slug", "name", "gradient", "is_active", "sort_order", "updated_at") VALUES
  (gen_random_uuid(), 'luxury-black', 'Luxury Black', 'linear-gradient(135deg,#0a0a0a,#1a1a2e,#9333ea22)', true, 1, NOW()),
  (gen_random_uuid(), 'purple-neon', 'Purple Neon', 'linear-gradient(135deg,#1e1033,#7c3aed,#c084fc)', true, 2, NOW()),
  (gen_random_uuid(), 'golden-elite', 'Golden Elite', 'linear-gradient(135deg,#1a1408,#b8860b,#ffd70044)', true, 3, NOW()),
  (gen_random_uuid(), 'cyber-blue', 'Cyber Blue', 'linear-gradient(135deg,#020617,#0ea5e9,#6366f1)', true, 4, NOW()),
  (gen_random_uuid(), 'minimal-white', 'Minimal White', 'linear-gradient(135deg,#f8fafc,#e2e8f0,#cbd5e1)', true, 5, NOW()),
  (gen_random_uuid(), 'gaming-theme', 'Gaming Theme', 'linear-gradient(135deg,#0f0f23,#ff006e,#8338ec)', true, 6, NOW()),
  (gen_random_uuid(), 'fashion-theme', 'Fashion Theme', 'linear-gradient(135deg,#18181b,#ec4899,#f472b6)', true, 7, NOW()),
  (gen_random_uuid(), 'birthday-theme', 'Birthday Theme', 'linear-gradient(135deg,#1e1b4b,#f59e0b,#fbbf24)', true, 8, NOW()),
  (gen_random_uuid(), 'festival-theme', 'Festival Theme', 'linear-gradient(135deg,#450a0a,#dc2626,#f97316)', true, 9, NOW()),
  (gen_random_uuid(), 'anniversary-theme', 'Anniversary Theme', 'linear-gradient(135deg,#1a0a2e,#be185d,#f9a8d4)', true, 10, NOW())
ON CONFLICT DO NOTHING;
