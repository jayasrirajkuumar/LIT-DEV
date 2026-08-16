# LIT Marketplace API

Backend service for user management and Azure External ID Just-In-Time provisioning.

## Quick Start

**Both servers are required for local marketplace development:**

```bash
# Terminal 1 — API (port 3001)
cd backend
cp .env.example .env
# Set DATABASE_URL in .env to your Azure PostgreSQL connection string
npm install
npm run prisma:migrate:deploy
npm run dev

# Terminal 2 — Frontend (port 5173, proxies /api → localhost:3001)
cd ..
npm install
npm run dev
```

Open http://localhost:5173/shop — the Vite dev server proxies `/api/*` to the backend.
If you see **"Failed to fetch"**, the backend is not running or Azure `DATABASE_URL` is misconfigured.
Ensure your IP is allowed in the Azure PostgreSQL firewall (or connect via VPN).

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health + DB connectivity |
| POST | `/api/auth/sync-user` | JIT user provisioning |
| GET | `/api/users/me` | Get authenticated profile |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/addresses` | List addresses |
| POST | `/api/addresses` | Create address |
| PATCH | `/api/addresses/:id` | Update address |
| DELETE | `/api/addresses/:id` | Delete address |
| GET | `/api/categories` | List active categories |
| GET | `/api/categories/:slug` | Category detail |
| GET | `/api/products` | List products (filters/sort) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/new-arrivals` | New arrivals |
| GET | `/api/products/search` | Search products |
| GET | `/api/products/category/:slug` | Products by category |
| GET | `/api/products/:slug` | Product detail |
| GET | `/api/marketplace/config` | Marketplace announcements, brands, sort/filter options |
| POST | `/api/admin/categories` | Create category (ADMIN) |
| PATCH | `/api/admin/categories/:id` | Update category (ADMIN) |
| DELETE | `/api/admin/categories/:id` | Delete category (ADMIN) |
| POST | `/api/admin/products` | Create product (ADMIN) |
| PATCH | `/api/admin/products/:id` | Update product (ADMIN) |
| DELETE | `/api/admin/products/:id` | Archive product (ADMIN) |

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — folder structure, ER diagram, auth flow
- [API Contract](./docs/API_CONTRACT.md) — user profile & addresses
- [Catalog API Contract](./docs/CATALOG_API_CONTRACT.md) — product catalog endpoints
- [Migration Plan](./docs/MIGRATION_PLAN.md) — database deployment steps
- [Roadmap](./docs/ROADMAP.md) — phased implementation plan
- [Testing Checklist](./docs/TESTING_CHECKLIST.md) — Phase 2 QA
- [Catalog Testing Checklist](./docs/CATALOG_TESTING_CHECKLIST.md) — Phase 3 QA

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

## Prisma Commands

```bash
npm run prisma:generate       # Regenerate client after schema changes
npm run prisma:migrate:dev    # Create + apply migration (development)
npm run prisma:migrate:deploy # Apply migrations (production)
npm run prisma:studio         # Visual database browser
```
