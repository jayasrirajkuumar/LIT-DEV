# LIT Database Migration Plan

## Target Environment

| Setting | Value |
|---------|-------|
| Host | `lit-postgres-dev.postgres.database.azure.com` |
| Database | `lit_dev` |
| Engine | PostgreSQL (Azure Flexible Server) |
| SSL | Required (`sslmode=require`) |

---

## Phase 0 — Prerequisites

1. **Create application database user** (do not use admin credentials in the app):

```sql
CREATE USER lit_app_user WITH PASSWORD 'strong-password-here';
GRANT CONNECT ON DATABASE lit_dev TO lit_app_user;
GRANT USAGE ON SCHEMA public TO lit_app_user;
GRANT CREATE ON SCHEMA public TO lit_app_user;
```

2. **Configure Azure firewall** — allow App Service outbound IPs and developer IPs.

3. **Copy environment file:**

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL with lit_app_user credentials
```

4. **Verify connectivity:**

```bash
npm install
npx prisma db pull --print   # optional sanity check
```

---

## Phase 1 — Initial Migration (Users Table)

Migration: `20250623000000_init_users`

Creates:
- `UserRole` enum (`CUSTOMER`, `SELLER`, `ADMIN`)
- `users` table with UUID PK, unique constraints, indexes

### Development

```bash
npm run prisma:migrate:dev
# Equivalent: npx prisma migrate dev --name init_users
```

Prisma will:
1. Apply pending migrations to `lit_dev`
2. Regenerate Prisma Client

### Production / Staging

```bash
npm run prisma:migrate:deploy
# Equivalent: npx prisma migrate deploy
```

> **Never** use `migrate dev` in production. Use `migrate deploy` only.

---

## Phase 2 — Profile & Addresses Migration

Migration: `20250623100000_add_phone_and_addresses`

Changes:
- Adds `phone_number` column to `users`
- Creates `AddressType` enum (`HOME`, `OFFICE`, `OTHER`)
- Creates `addresses` table with FK to `users.id` (ON DELETE CASCADE)

### Apply

```bash
npm run prisma:migrate:deploy
npm run verify:foundation
npx prisma generate
```

---

## Phase 3 — Catalog Migration

Migration: `20250623120000_add_catalog`

Creates:
- `ProductStatus` enum
- `categories`, `products`, `product_images`, `product_inventory` tables

```bash
npm run prisma:migrate:deploy
npm run verify:foundation
npx prisma generate
```

---

## Phase 4 — Verification

```bash
npx prisma studio          # Inspect users table
curl http://localhost:3001/api/health
```

Run a test sync after Azure login:

```bash
curl -X POST http://localhost:3001/api/auth/sync-user \
  -H "Authorization: Bearer <azure_id_token>" \
  -H "Content-Type: application/json"
```

Expected: `201` on first login, `200` on subsequent logins.

---

## Phase 3 — Rollback Strategy

Prisma migrations are forward-only in production. For rollback:

1. Create a new migration that reverses changes (drop table / alter column).
2. Deploy with `prisma migrate deploy`.

**Emergency rollback** (dev only):

```sql
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS "UserRole";
```

Then reset Prisma migration history:

```bash
npx prisma migrate reset   # DEV ONLY — destroys all data
```

---

## Phase 4 — Future Migrations (Planned)

| Migration | Tables | Depends On |
|-----------|--------|------------|
| `add_categories` | `categories` | — | ✅ Phase 3 |
| `add_products` | `products`, `product_images`, `product_inventory` | `categories` | ✅ Phase 3 |
| `add_cart` | `carts`, `cart_items` | `users`, `products` |
| `add_wishlist` | `wishlists` | `users`, `products` |
| `add_addresses` | `addresses` | `users` | ✅ Phase 2 |
| `add_orders` | `orders`, `order_items` | `users`, `products`, `addresses` |
| `add_reviews` | `reviews` | `users`, `products`, `orders` |
| `add_seller_accounts` | `seller_accounts` | `users` |

Each future table references `users.id` (UUID). The current `users` schema requires **no changes** when these are added.

---

## CI/CD Integration

Recommended pipeline steps:

```yaml
- npm ci
- npx prisma generate
- npx prisma migrate deploy
- npm start
```

Store `DATABASE_URL` in Azure Key Vault / App Service configuration — never in source control.
