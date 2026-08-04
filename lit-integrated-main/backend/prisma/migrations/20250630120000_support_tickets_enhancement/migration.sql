-- Support ticket enhancements: ticket numbers, guest contact fields, priority, assignment

CREATE TYPE "SupportRequestPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "support_requests" ADD COLUMN "ticket_number" VARCHAR(20);
ALTER TABLE "support_requests" ADD COLUMN "contact_name" VARCHAR(255);
ALTER TABLE "support_requests" ADD COLUMN "contact_email" VARCHAR(320);
ALTER TABLE "support_requests" ADD COLUMN "category" VARCHAR(100);
ALTER TABLE "support_requests" ADD COLUMN "priority" "SupportRequestPriority" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "support_requests" ADD COLUMN "assigned_to" UUID;

-- Backfill contact fields from linked users
UPDATE "support_requests" sr
SET
  "contact_name" = COALESCE(u."display_name", split_part(u."email", '@', 1), 'Customer'),
  "contact_email" = u."email"
FROM "users" u
WHERE sr."user_id" = u."id"
  AND sr."contact_email" IS NULL;

-- Backfill ticket numbers for existing rows
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at" ASC) AS rn
  FROM "support_requests"
  WHERE "ticket_number" IS NULL
)
UPDATE "support_requests" sr
SET "ticket_number" = 'LIT-' || LPAD(numbered.rn::text, 6, '0')
FROM numbered
WHERE sr.id = numbered.id;

-- Default subject for rows missing one
UPDATE "support_requests"
SET "subject" = 'Support Request'
WHERE "subject" IS NULL OR TRIM("subject") = '';

ALTER TABLE "support_requests" ALTER COLUMN "ticket_number" SET NOT NULL;
ALTER TABLE "support_requests" ALTER COLUMN "contact_name" SET NOT NULL;
ALTER TABLE "support_requests" ALTER COLUMN "contact_email" SET NOT NULL;
ALTER TABLE "support_requests" ALTER COLUMN "subject" SET NOT NULL;

-- Allow guest submissions (nullable user_id)
ALTER TABLE "support_requests" DROP CONSTRAINT "support_requests_user_id_fkey";
ALTER TABLE "support_requests" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_assigned_to_fkey"
  FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "support_requests_ticket_number_key" ON "support_requests"("ticket_number");
CREATE INDEX "idx_support_requests_ticket_number" ON "support_requests"("ticket_number");
CREATE INDEX "idx_support_requests_contact_email" ON "support_requests"("contact_email");
CREATE INDEX "idx_support_requests_priority" ON "support_requests"("priority");
CREATE INDEX "idx_support_requests_assigned_to" ON "support_requests"("assigned_to");
