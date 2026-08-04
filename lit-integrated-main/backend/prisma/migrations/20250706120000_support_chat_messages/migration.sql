-- Support chat: messages table, conversation metadata, extended statuses

ALTER TYPE "SupportRequestStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_CUSTOMER';
ALTER TYPE "SupportRequestStatus" ADD VALUE IF NOT EXISTS 'WAITING_FOR_SUPPORT';

CREATE TYPE "SupportMessageSenderType" AS ENUM ('CUSTOMER', 'ADMIN');

ALTER TABLE "support_requests"
  ADD COLUMN "last_message_at" TIMESTAMPTZ(6),
  ADD COLUMN "last_message_preview" VARCHAR(500),
  ADD COLUMN "customer_last_opened_at" TIMESTAMPTZ(6);

CREATE TABLE "support_messages" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "sender_type" "SupportMessageSenderType" NOT NULL,
  "sender_id" UUID,
  "message" TEXT NOT NULL,
  "attachment_url" TEXT,
  "attachment_type" VARCHAR(32),
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_support_messages_conversation_created"
  ON "support_messages"("conversation_id", "created_at");
CREATE INDEX "idx_support_messages_conversation_read"
  ON "support_messages"("conversation_id", "is_read");

ALTER TABLE "support_messages"
  ADD CONSTRAINT "support_messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "support_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_messages"
  ADD CONSTRAINT "support_messages_sender_id_fkey"
  FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill initial customer messages from legacy support_requests.message
INSERT INTO "support_messages" (
  "id", "conversation_id", "sender_type", "sender_id", "message", "is_read", "created_at", "updated_at"
)
SELECT
  gen_random_uuid(),
  sr."id",
  'CUSTOMER'::"SupportMessageSenderType",
  sr."user_id",
  sr."message",
  true,
  sr."created_at",
  sr."updated_at"
FROM "support_requests" sr
WHERE NOT EXISTS (
  SELECT 1 FROM "support_messages" sm WHERE sm."conversation_id" = sr."id"
);

-- Backfill admin replies as chat messages
INSERT INTO "support_messages" (
  "id", "conversation_id", "sender_type", "sender_id", "message", "is_read", "created_at", "updated_at"
)
SELECT
  gen_random_uuid(),
  rr."support_request_id",
  'ADMIN'::"SupportMessageSenderType",
  rr."admin_user_id",
  rr."message",
  true,
  rr."created_at",
  rr."created_at"
FROM "support_request_replies" rr;

UPDATE "support_requests" sr
SET
  "last_message_at" = lm."created_at",
  "last_message_preview" = LEFT(lm."message", 500)
FROM (
  SELECT DISTINCT ON ("conversation_id")
    "conversation_id", "message", "created_at"
  FROM "support_messages"
  ORDER BY "conversation_id", "created_at" DESC
) lm
WHERE sr."id" = lm."conversation_id"
  AND sr."last_message_at" IS NULL;

CREATE INDEX "idx_support_requests_last_message_at" ON "support_requests"("last_message_at");
