CREATE TABLE "support_internal_notes" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "admin_user_id" UUID NOT NULL,
  "note" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_internal_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_activity_logs" (
  "id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "admin_user_id" UUID,
  "action" VARCHAR(64) NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_notifications" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" VARCHAR(64) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "entity_type" VARCHAR(64),
  "entity_id" VARCHAR(128),
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_support_internal_notes_conversation" ON "support_internal_notes"("conversation_id", "created_at");
CREATE INDEX "idx_support_activity_conversation" ON "support_activity_logs"("conversation_id", "created_at");
CREATE INDEX "idx_user_notifications_user_unread" ON "user_notifications"("user_id", "is_read", "created_at");

ALTER TABLE "support_internal_notes" ADD CONSTRAINT "support_internal_notes_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "support_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_internal_notes" ADD CONSTRAINT "support_internal_notes_admin_user_id_fkey"
  FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_activity_logs" ADD CONSTRAINT "support_activity_logs_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "support_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_activity_logs" ADD CONSTRAINT "support_activity_logs_admin_user_id_fkey"
  FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
