# Phase 3.5 — Seed Data & Frontend Catalog Integration

This guide covers database seeding, React marketplace integration, API usage, and manual testing for Phase 3.5.

---

## Prerequisites

- PostgreSQL running with `DATABASE_URL` configured in `backend/.env`
- Backend dependencies installed: `cd backend && npm install`
- Frontend env (optional override):

```env
VITE_USER_API_BASE_URL=http://localhost:3001/api
```

---

## Database Seeding

### What gets seeded

| Resource | Count | Notes |
|----------|-------|-------|
| Categories | 7 | Luxury Watches, Perfumes, Handbags, Shoes, Jewelry, Clothing, Accessories |
| Products | 42 | 6 products per category (3 brands × 2 items) |

Each product includes:

- Realistic name, brand, descriptions
- SKU and slug (unique)
- Price, compare price, INR currency
- Inventory quantities
- Placeholder product images (Unsplash URLs)
- Featured flags (~30% of products)
- New arrivals (sorted by `createdAt` on the API)

### Idempotency

The seed script uses **upsert** keys:

- Categories: `slug`
- Products: `sku`

Re-running the seed updates existing records and replaces product images without creating duplicates.

### Commands

```bash
cd backend

# Apply migrations (if needed)
npm run prisma:migrate:deploy

# Generate Prisma client
npm run prisma:generate

# Run seed
npm run prisma:seed
```

Equivalent via Prisma CLI:

```bash
npx prisma db seed
```

Expected output:

```
Seeding LIT luxury marketplace...
  ✓ Category: Luxury Watches
  ...
  ✓ Products seeded: 42
Seed complete.
```

---

## Frontend Integration

### Service layer

All catalog calls go through `src/services/catalogApiService.js`:

| Function | Endpoint |
|----------|----------|
| `getCategories()` | `GET /api/categories` |
| `getCategoryBySlug(slug)` | `GET /api/categories/:slug` |
| `getProducts(params)` | `GET /api/products` |
| `getProductBySlug(slug)` | `GET /api/products/:slug` |
| `getProductsByCategory(slug, params)` | `GET /api/products/category/:slug` |
| `searchProducts(params)` | `GET /api/products/search?q=` |
| `getFeaturedProducts(limit)` | `GET /api/products/featured` |
| `getNewArrivalProducts(limit)` | `GET /api/products/new-arrivals` |

### Routes

| Path | Page |
|------|------|
| `/shop` | Shop home — categories, featured, new arrivals |
| `/shop/products` | Full catalog with filters, sort, pagination |
| `/shop/category/:slug` | Category listing |
| `/shop/product/:slug` | Product detail + image gallery |
| `/shop/search?q=` | Search results |

Legacy `/products` redirects to `/shop/products`.

### Performance features

- **Lazy images** — `LazyImage` component with skeleton placeholder
- **Skeleton loaders** — `ProductSkeleton` during API fetch
- **Pagination** — server-side via `page` and `limit` query params
- **Client cache** — `useCatalogQuery` hook (60s stale time per cache key)
- **Optimized calls** — query keys include filter/sort/page params to avoid redundant fetches

### UI states

- Loading: skeleton grids
- Empty: `EmptyState` with contextual copy
- Error: `ErrorState` with retry button

---

## API Query Parameters (Listing & Search)

Shared query params for `GET /api/products`, `GET /api/products/search`, and `GET /api/products/category/:slug`:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `category` | string | — | Category slug filter |
| `brand` | string | — | Brand filter (case-insensitive) |
| `minPrice` | number | — | Minimum price |
| `maxPrice` | number | — | Maximum price |
| `availability` | enum | `all` | `all`, `in_stock`, `out_of_stock`, `low_stock` |
| `sort` | enum | `newest` | `newest`, `price_asc`, `price_desc`, `popularity` |

Search additionally requires `q` (query string).

---

## Local Development Workflow

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd ..
npm run dev
```

1. Seed the database (see above)
2. Open `http://localhost:5173/shop`
3. Browse categories, product detail, search, filters, and pagination

---

## Testing Checklist

### Seed

- [ ] `npm run prisma:seed` completes without errors
- [ ] 7 categories exist in database
- [ ] 42 products exist with inventory and images
- [ ] Re-running seed does not duplicate rows

### Shop Home (`/shop`)

- [ ] Categories grid loads from API
- [ ] Featured products section renders
- [ ] New arrivals section renders
- [ ] Skeleton shows while loading
- [ ] Error state if backend is down

### Product Listing (`/shop/products`)

- [ ] Products load with pagination
- [ ] Sort by price/name works
- [ ] Brand filter works
- [ ] Price range filter works
- [ ] Availability filter works
- [ ] Empty state when no matches

### Category Page (`/shop/category/:slug`)

- [ ] Category name and description display
- [ ] Only category products shown
- [ ] Filters and pagination work

### Product Detail (`/shop/product/:slug`)

- [ ] Product info, pricing, description load
- [ ] Image gallery with thumbnails works
- [ ] Stock status displays correctly
- [ ] Category link navigates correctly

### Search (`/shop/search?q=chanel`)

- [ ] Results match query
- [ ] Empty state for unknown terms
- [ ] Filters apply to search results

### Performance

- [ ] Images lazy-load (network tab shows deferred loads)
- [ ] Repeated navigation uses cached data within 60s
- [ ] No static JSON files used for catalog data

### Out of scope (Phase 3.5)

- [ ] Cart, wishlist, checkout, orders, payments — not implemented

---

## File Reference

| File | Purpose |
|------|---------|
| `backend/prisma/seed.js` | Idempotent seed runner |
| `backend/prisma/seedData.js` | Category and product templates |
| `src/services/catalogApiService.js` | API client |
| `src/hooks/useCatalogQuery.js` | Cached fetch hook |
| `src/pages/marketplace/*` | Shop pages |
| `src/components/marketplace/*` | Reusable catalog UI |
| `src/styles/marketplace.css` | Marketplace styles |
