-- Admin operations: audit log, notifications, store settings

CREATE TABLE "admin_audit_logs" (
    "id" UUID NOT NULL,
    "admin_user_id" UUID,
    "action" VARCHAR(64) NOT NULL,
    "entity_type" VARCHAR(64),
    "entity_id" VARCHAR(128),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_notifications" (
    "id" UUID NOT NULL,
    "type" VARCHAR(64) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" VARCHAR(64),
    "entity_id" VARCHAR(128),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_settings" (
    "id" UUID NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "store_settings_key_key" ON "store_settings"("key");
CREATE INDEX "idx_admin_audit_created" ON "admin_audit_logs"("created_at");
CREATE INDEX "idx_admin_audit_action" ON "admin_audit_logs"("action");
CREATE INDEX "idx_admin_notifications_unread" ON "admin_notifications"("is_read", "created_at");

ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
