# LIT Catalog — Testing Checklist (Phase 3)

## Prerequisites

- [ ] Phase 1 & 2 migrations applied
- [ ] Phase 3 migration applied: `npm run prisma:migrate:deploy`
- [ ] `npm run verify:foundation` passes catalog tables
- [ ] Admin user exists with `role = ADMIN` in database
- [ ] Backend running on port 3001

```bash
export API=http://localhost:3001/api
export ADMIN_TOKEN="<admin_id_token>"
```

---

## Categories (Public)

| # | Test | Expected | Pass |
|---|------|----------|------|
| 1 | `GET /api/categories` | Active categories sorted by displayOrder | ☐ |
| 2 | `GET /api/categories/:slug` | Category detail + productCount | ☐ |
| 3 | Invalid slug | HTTP 404 | ☐ |

---

## Products (Public)

| # | Test | Expected | Pass |
|---|------|----------|------|
| 4 | `GET /api/products` | Paginated ACTIVE products | ☐ |
| 5 | Filter by `category` slug | Only category products | ☐ |
| 6 | Filter by `brand` | Brand match | ☐ |
| 7 | Filter `minPrice` / `maxPrice` | Price range works | ☐ |
| 8 | Filter `availability=in_stock` | Only in-stock items | ☐ |
| 9 | Sort `price_asc` | Ascending price | ☐ |
| 10 | Sort `price_desc` | Descending price | ☐ |
| 11 | Sort `popularity` | By viewCount | ☐ |
| 12 | `GET /api/products/featured` | Featured products only | ☐ |
| 13 | `GET /api/products/new-arrivals` | Newest first | ☐ |
| 14 | `GET /api/products/search?q=burberry` | Search results | ☐ |
| 15 | `GET /api/products/category/:slug` | Category scoped list | ☐ |
| 16 | `GET /api/products/:slug` | Product detail + inventory helpers | ☐ |
| 17 | View product twice | viewCount increments | ☐ |
| 18 | DRAFT product not in public list | Hidden | ☐ |

---

## Admin Categories

| # | Test | Expected | Pass |
|---|------|----------|------|
| 19 | POST category without auth | HTTP 401 | ☐ |
| 20 | POST category as CUSTOMER | HTTP 403 | ☐ |
| 21 | POST category as ADMIN | HTTP 201 | ☐ |
| 22 | PATCH category | Fields updated | ☐ |
| 23 | DELETE empty category | HTTP 200 | ☐ |
| 24 | DELETE category with products | HTTP 409 | ☐ |
| 25 | Duplicate slug | HTTP 409 | ☐ |

---

## Admin Products

| # | Test | Expected | Pass |
|---|------|----------|------|
| 26 | POST product with images + inventory | HTTP 201, relations created | ☐ |
| 27 | Duplicate SKU | HTTP 409 | ☐ |
| 28 | PATCH inventory quantity to 0 | Status → OUT_OF_STOCK | ☐ |
| 29 | PATCH set isFeatured | Appears in /featured | ☐ |
| 30 | DELETE product | Status ARCHIVED, hidden from public | ☐ |

---

## Inventory Helpers

| # | Test | Expected | Pass |
|---|------|----------|------|
| 31 | quantity=10, reserved=2 | availableQuantity=8 | ☐ |
| 32 | quantity=3, threshold=5 | isLowStock=true | ☐ |
| 33 | quantity=0 | isInStock=false | ☐ |

---

## Frontend Service

| # | Test | Expected | Pass |
|---|------|----------|------|
| 34 | `getCategories()` | Returns array | ☐ |
| 35 | `getProducts({ sort: 'price_asc' })` | Sorted results | ☐ |
| 36 | `searchProducts({ q: 'bag' })` | Search works | ☐ |

---

## Regression

| # | Test | Expected | Pass |
|---|------|----------|------|
| 37 | `/api/auth/sync-user` unchanged | Still works | ☐ |
| 38 | `/api/users/me` unchanged | Still works | ☐ |
| 39 | `/api/addresses` unchanged | Still works | ☐ |
