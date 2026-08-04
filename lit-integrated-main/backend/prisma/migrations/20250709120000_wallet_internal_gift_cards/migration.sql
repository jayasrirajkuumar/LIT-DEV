-- Wallet + Internal Gift Card System

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username") WHERE "username" IS NOT NULL;

CREATE TYPE "GiftCardClaimStatus" AS ENUM ('PENDING', 'CLAIMED', 'DECLINED');
CREATE TYPE "WalletTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'GIFT_RECEIVED', 'GIFT_SENT', 'GIFT_REFUND', 'PAYMENT', 'TOP_UP', 'REFUND');

ALTER TYPE "GiftCardStatus" ADD VALUE IF NOT EXISTS 'DELIVERED';
ALTER TYPE "GiftCardStatus" ADD VALUE IF NOT EXISTS 'DECLINED';

ALTER TABLE "gift_cards" ADD COLUMN IF NOT EXISTS "recipient_id" UUID;
ALTER TABLE "gift_cards" ADD COLUMN IF NOT EXISTS "claim_status" "GiftCardClaimStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "gift_cards" ADD COLUMN IF NOT EXISTS "is_internal" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "gift_cards" ADD COLUMN IF NOT EXISTS "claimed_at" TIMESTAMPTZ(6);
ALTER TABLE "gift_cards" ADD COLUMN IF NOT EXISTS "declined_at" TIMESTAMPTZ(6);
ALTER TABLE "gift_cards" ALTER COLUMN "pin_hash" DROP NOT NULL;
ALTER TABLE "gift_cards" ALTER COLUMN "recipient_email" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_gift_cards_recipient_id" ON "gift_cards"("recipient_id");
CREATE INDEX IF NOT EXISTS "idx_gift_cards_claim_status" ON "gift_cards"("claim_status");

ALTER TABLE "gift_cards" ADD CONSTRAINT "gift_cards_recipient_id_fkey"
  FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "wallets" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "wallet_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total_credits" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total_debits" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "is_frozen" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");
CREATE INDEX "idx_wallets_user_id" ON "wallets"("user_id");
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "wallet_transactions" (
  "id" UUID NOT NULL,
  "wallet_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "WalletTransactionType" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "balance_after" DECIMAL(12,2) NOT NULL,
  "reference_type" VARCHAR(64),
  "reference_id" VARCHAR(128),
  "description" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_wallet_tx_user_created" ON "wallet_transactions"("user_id", "created_at");
CREATE INDEX "idx_wallet_tx_wallet_created" ON "wallet_transactions"("wallet_id", "created_at");
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey"
  FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "gift_card_transactions" (
  "id" UUID NOT NULL,
  "gift_card_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" VARCHAR(32) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "payment_provider" "PaymentProvider",
  "provider_ref" VARCHAR(255),
  "wallet_transaction_id" UUID,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gift_card_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "idx_gift_card_tx_card" ON "gift_card_transactions"("gift_card_id", "created_at");
CREATE INDEX "idx_gift_card_tx_user" ON "gift_card_transactions"("user_id", "created_at");
ALTER TABLE "gift_card_transactions" ADD CONSTRAINT "gift_card_transactions_gift_card_id_fkey"
  FOREIGN KEY ("gift_card_id") REFERENCES "gift_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill wallets from existing users (migrate gift_card_balance)
INSERT INTO "wallets" ("id", "user_id", "wallet_balance", "total_credits", "total_debits", "updated_at")
SELECT gen_random_uuid(), u."id", COALESCE(u."gift_card_balance", 0), COALESCE(u."gift_card_balance", 0), 0, NOW()
FROM "users" u
WHERE NOT EXISTS (SELECT 1 FROM "wallets" w WHERE w."user_id" = u."id");
