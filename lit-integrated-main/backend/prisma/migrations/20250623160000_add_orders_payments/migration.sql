-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED');

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'CANCELLED');

CREATE TYPE "PaymentProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'MOCK');

CREATE TYPE "DeliveryMethod" AS ENUM ('STANDARD', 'EXPRESS');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_number" VARCHAR(32) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shipping_charge" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(12,2) NOT NULL,
    "payment_status" "PaymentStatus" NOT NULL,
    "order_status" "OrderStatus" NOT NULL,
    "payment_method" VARCHAR(50),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "delivery_method" "DeliveryMethod",
    "delivery_estimate" VARCHAR(255),
    "coupon_code" VARCHAR(64),
    "gift_message" TEXT,
    "order_notes" TEXT,
    "tracking_number" VARCHAR(128),
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name_snapshot" VARCHAR(255) NOT NULL,
    "sku_snapshot" VARCHAR(64) NOT NULL,
    "price_snapshot" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_shipping_addresses" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,

    CONSTRAINT "order_shipping_addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "note" TEXT,
    "changed_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_intents" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL,
    "provider_ref" VARCHAR(255),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "payment_intent_id" UUID NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "provider_txn_id" VARCHAR(255),
    "raw_response" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "idx_orders_user_id" ON "orders"("user_id");
CREATE INDEX "idx_orders_status" ON "orders"("order_status");
CREATE INDEX "idx_orders_payment_status" ON "orders"("payment_status");
CREATE INDEX "idx_orders_order_number" ON "orders"("order_number");
CREATE INDEX "idx_orders_created_at" ON "orders"("created_at");
CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");
CREATE INDEX "idx_order_items_product_id" ON "order_items"("product_id");
CREATE UNIQUE INDEX "order_shipping_addresses_order_id_key" ON "order_shipping_addresses"("order_id");
CREATE INDEX "idx_order_status_history_order_created" ON "order_status_history"("order_id", "created_at");
CREATE INDEX "idx_payment_intents_order_id" ON "payment_intents"("order_id");
CREATE INDEX "idx_payment_intents_user_id" ON "payment_intents"("user_id");
CREATE INDEX "idx_payment_intents_status" ON "payment_intents"("status");
CREATE INDEX "idx_payment_transactions_intent_id" ON "payment_transactions"("payment_intent_id");

-- Foreign Keys
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_shipping_addresses" ADD CONSTRAINT "order_shipping_addresses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
