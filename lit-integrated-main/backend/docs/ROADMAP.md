# LIT Backend — Implementation Roadmap

## Phase 1 — Foundation ✅

Azure auth, users table, JIT provisioning, security middleware.

## Phase 2 — User Profile & Addresses ✅

Profile API, address CRUD, React `userApiService.js`.

## Phase 3 — Product Catalog ✅

| Item | Status |
|------|--------|
| Categories model + APIs | ✅ |
| Products model + status enum | ✅ |
| Product images (1:N) | ✅ |
| Product inventory + helpers | ✅ |
| Public listing, search, filters, sorting | ✅ |
| Featured + new arrivals | ✅ |
| Admin category/product CRUD | ✅ |
| React `catalogApiService.js` | ✅ |
| Documentation + testing checklist | ✅ |

**Exit criteria:**
- [ ] Phase 3 migration deployed
- [ ] Seed categories/products for store UI
- [ ] Wire Store page to `catalogApiService`

---

## Phase 4 — Cart & Wishlist

| Tables | `carts`, `cart_items`, `wishlists` |

---

## Phase 5 — Orders & Checkout

| Tables | `orders`, `order_items` |

---

## Phase 6 — Reviews & Seller Portal

| Tables | `seller_accounts`, `reviews` |

---

## Phase 7 — Coupons & Payments

No catalog schema changes required.
