# LIT Backend — Architecture

Production-ready user management for the LIT (Luxury In Taste) marketplace.

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| HTTP | Express 4 |
| ORM | Prisma 6 |
| Database | Azure PostgreSQL Flexible Server (`lit_dev`) |
| Auth | Azure External ID (CIAM) — JWT validation via JWKS |

---

## Folder Structure & Responsibilities

```
backend/
├── prisma/
│   ├── schema.prisma                # DB models (User, Address)
│   └── migrations/                  # Versioned SQL migrations
├── scripts/
│   └── verify-foundation.js         # Pre-deploy foundation checks
├── src/
│   ├── config/
│   │   ├── env.js                   # Validated environment variables (Zod)
│   │   └── azureAuth.js             # Azure ID token validation (JWKS)
│   ├── database/
│   │   └── prismaClient.js          # Prisma singleton, connect/disconnect
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT validation + attachDbUser
│   │   ├── errorHandler.js          # Centralized error responses
│   │   ├── rateLimiter.js           # Global + auth rate limits
│   │   └── validateRequest.js       # Zod body + param validation
│   ├── controllers/                 # HTTP handlers (no DB logic)
│   │   ├── authController.js        # POST /api/auth/sync-user
│   │   ├── userController.js        # GET/PATCH /api/users/me
│   │   └── addressController.js     # CRUD /api/addresses
│   ├── services/                    # Business rules
│   │   ├── authService.js           # Token sync orchestration
│   │   ├── userService.js           # JIT provisioning (Phase 1)
│   │   ├── profileService.js        # Profile read/update (Phase 2)
│   │   └── addressService.js        # Address CRUD rules (Phase 2)
│   ├── repositories/                # Prisma data access only
│   │   ├── userRepository.js
│   │   └── addressRepository.js
│   ├── routes/
│   │   ├── index.js                 # /api mount, health, legacy routes
│   │   ├── authRoutes.js            # /api/auth/*
│   │   ├── userRoutes.js            # /api/users/*
│   │   └── addressRoutes.js         # /api/addresses/*
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   └── app.js
├── docs/
├── server.js
└── package.json
```

| Folder | Responsibility |
|--------|----------------|
| `config/` | External integrations and startup configuration |
| `database/` | Prisma client lifecycle |
| `middleware/` | Cross-cutting HTTP concerns before controllers |
| `controllers/` | Parse HTTP, call services, format responses |
| `services/` | Business logic, authorization rules, orchestration |
| `repositories/` | All Prisma queries — no business rules |
| `routes/` | Express route wiring |
| `utils/` | Shared non-domain helpers |

---

## Database Architecture (Phase 2)

### Entity: `users`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `azure_user_id` | VARCHAR(128) | UNIQUE — Azure `sub` |
| `email` | VARCHAR(320) | UNIQUE — read-only via API |
| `display_name` | VARCHAR(255) | Editable |
| `phone_number` | VARCHAR(20) | Editable, optional |
| `profile_picture` | TEXT | URL only |
| `role` | UserRole | CUSTOMER default |
| `is_active` | BOOLEAN | Default true |
| `created_at` / `updated_at` / `last_login` | TIMESTAMPTZ | |

### Entity: `addresses`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users.id CASCADE |
| `full_name` | VARCHAR(255) | |
| `phone` | VARCHAR(20) | |
| `address_line_1` / `address_line_2` | VARCHAR | |
| `city` / `state` / `postal_code` / `country` | VARCHAR | |
| `address_type` | AddressType | HOME, OFFICE, OTHER |
| `is_default` | BOOLEAN | Max one true per user |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### ER Diagram (Phase 2 + 3)

```
users (1) ──────< addresses

categories (1) ──────< products (1) ──────< product_images
                              │
                              │ (1:1)
                              ▼
                       product_inventory
                              │
         Future FKs: carts, wishlists, orders, reviews, seller_accounts
```

### Entity: `categories` (Phase 3)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `name` | VARCHAR(255) | |
| `slug` | VARCHAR(255) | UNIQUE |
| `description` | TEXT | Optional |
| `image_url` | TEXT | Optional |
| `is_active` | BOOLEAN | Default true |
| `display_order` | INT | Sort order |

### Entity: `products` (Phase 3)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `category_id` | UUID | FK → categories |
| `name`, `slug`, `sku` | VARCHAR | slug + sku UNIQUE |
| `brand` | VARCHAR(255) | Filterable |
| `price`, `compare_price` | DECIMAL | |
| `currency` | VARCHAR(3) | Default INR |
| `status` | ProductStatus | ACTIVE, DRAFT, OUT_OF_STOCK, ARCHIVED |
| `weight`, `dimensions` | DECIMAL / JSON | Optional |
| `is_featured`, `view_count` | BOOLEAN / INT | Featured + popularity |

### Entity: `product_inventory` (Phase 3)

| Column | Type | Notes |
|--------|------|-------|
| `quantity` | INT | Total stock |
| `reserved_quantity` | INT | Reserved for future orders |
| `low_stock_threshold` | INT | Low stock alert threshold |

Helpers: `isInStock()`, `isLowStock()`, `availableQuantity()` in `utils/inventoryHelpers.js`

---

## Request Flow (Phase 2 Profile)

```
Client → requireAzureAuth → attachDbUser → validateBody → Controller → Service → Repository → PostgreSQL
```

- `requireAzureAuth`: Validates JWT, sets `req.auth`
- `attachDbUser`: Loads user by `azure_user_id`, sets `req.dbUser`
- All address queries scoped by `req.dbUser.id` — users cannot access others' data

---

## Authentication Sequence (unchanged — Phase 1)

```
User → Azure CIAM (PKCE) → id_token → POST /api/auth/sync-user → JIT create/update → profile returned
```

After sync, client uses same token for:
- `GET/PATCH /api/users/me`
- `/api/addresses/*`

---

## Security

| Control | Implementation |
|---------|----------------|
| Token validation | JWKS via `jose` |
| User isolation | All queries filtered by `req.dbUser.id` |
| Email immutability | Rejected at controller if sent in PATCH body |
| Default address | Transaction — unset others when setting default |
| Rate limiting | Global + auth-specific limits |
| SSL | `sslmode=require` on Azure PostgreSQL |

---

## API Endpoints Summary

| Method | Path | Phase |
|--------|------|-------|
| POST | `/api/auth/sync-user` | 1 |
| GET/PATCH | `/api/users/me` | 2 |
| CRUD | `/api/addresses/*` | 2 |
| GET | `/api/categories`, `/api/categories/:slug` | 3 |
| GET | `/api/products/*` | 3 |
| CRUD | `/api/admin/categories/*` | 3 |
| CRUD | `/api/admin/products/*` | 3 |
| GET | `/api/health` | 1 |

See [API_CONTRACT.md](./API_CONTRACT.md) and [CATALOG_API_CONTRACT.md](./CATALOG_API_CONTRACT.md).

---

## Frontend Integration

React API service: `src/services/userApiService.js`

```javascript
import { getProfile, updateProfile, getAddresses, createAddress } from "./services/userApiService";
```

UI components are unchanged — wire these functions when ready.
