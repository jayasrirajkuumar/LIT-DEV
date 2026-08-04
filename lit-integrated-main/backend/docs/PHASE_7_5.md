# Phase 7.5 — Admin Dashboard QA Report

Phase 7.5 focused on fixing existing admin UI/layout issues and verifying PostgreSQL-backed admin data flows. No new marketplace features were added.

---

## 1. Sidebar Issues Fixed

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Notification badge overlapping logo | Bell button lived inside brand row with `margin-left: auto` | Removed inline notification panel; badge moved to **Notifications** nav item |
| Sidebar vertical overflow / scrollbar in nav | Too many items + embedded notification panel consuming height | Removed floating panel; sidebar uses `overflow: hidden` + nav scroll with thin styled scrollbar |
| Inconsistent spacing | Mixed legacy `ecom-sidebar.css` width/padding overrides | Trimmed `EcomSidebar.css` to mobile-only rules; layout uses `admin-design-system.css` |
| Collapse button misaligned | Footer actions not grouped | Added `adm-sidebar__footer-actions` row for sign-out + collapse |
| Profile card cramped | Missing text truncation styles | Added `adm-sidebar__profile-text` + email ellipsis |
| Active highlight inconsistent | Already defined in design system | Preserved gradient active state on `adm-sidebar__link.active` |

**Result:** Sidebar occupies full viewport height (`100dvh`), nav scrolls internally when needed, footer stays pinned at bottom.

---

## 2. Customer Issue — Root Cause

**Symptom:** Customers page appeared empty despite users in PostgreSQL.

**Root cause:** API response shape mismatch.

```
GET /api/admin/customers
→ { success: true, data: { customers: [...] } }
```

Frontend `fetchAdminCustomers()` returned the full `data` object, and `AdminCustomersView` used:

```javascript
Array.isArray(data) ? data : []  // always []
```

**Fix:** `fetchAdminCustomers` now returns `data.customers ?? []`.

**Backend verification:** `listAdminCustomers()` correctly filters `role: "CUSTOMER"` unless overridden.

**Empty state:** When no filters applied and zero rows → **"No customers registered yet."**

---

## 3. Inventory Issue — Root Cause

**Symptom:** Inventory page appeared empty despite products in catalog.

**Root cause:** Same response mapping bug.

```
GET /api/admin/inventory
→ { success: true, data: { inventory: [...] } }
```

Frontend treated non-array payload as empty.

**Fixes:**
1. `fetchAdminInventory` returns `data.inventory ?? []`
2. `listAdminInventory()` auto-creates missing `product_inventory` rows (default qty 0, threshold 5)

**Empty state:** Contextual message when no products vs no search matches.

---

## 4. Notifications — Dedicated Page

**Route:** `/admin/ecomDashboard/notifications`

**Removed:** Floating notification panel inside sidebar.

**Sidebar:** Notifications menu item with unread badge count.

**Page features:**
- All / Unread / Read filter
- Mark all read
- Mark individual read
- Delete notification
- Detail drawer with type, message, entity reference

**New API:** `DELETE /api/admin/notifications/:id`

---

## 5. APIs Verified

| Module | Endpoint | Status |
|--------|----------|--------|
| Dashboard | `GET /admin/dashboard` | Real PostgreSQL aggregates |
| Products | `GET /admin/products` | Paginated catalog |
| Categories | `GET /admin/categories` | DB-backed |
| Customers | `GET /admin/customers` | Fixed mapping |
| Orders | `GET /admin/orders` | DB-backed |
| Inventory | `GET /admin/inventory` | Fixed mapping + auto inventory rows |
| Notifications | `GET /admin/notifications` | Dedicated page |
| Audit Logs | `GET /admin/audit-log` | DB-backed |
| Support | `GET /admin/support/requests` | DB-backed |
| Wishlists | `GET /admin/wishlists/collections` | Read-only |
| Settings | `GET/PATCH /admin/settings` | DB-backed |
| Exports | `GET /admin/*/export` | Server-generated CSV/Excel |

No mock data paths remain in admin list views.

---

## 6. Database Verification

- **Customers:** `users` table filtered by `role = CUSTOMER`
- **Inventory:** `products` joined with `product_inventory`; missing rows created on list
- **Notifications:** `admin_notifications` table
- **Support:** `support_requests` table
- **Wishlists:** `wishlist_collections` table

---

## 7. Empty States Improved

| Page | Empty Message |
|------|---------------|
| Customers | "No customers registered yet." |
| Inventory | Contextual (no products vs no search match) |
| Notifications | Illustration + description on dedicated page |
| Support | "No support requests yet." |
| Wishlists | "No collections found." |

---

## 8. Remaining / Known Items

| Item | Notes |
|------|-------|
| Analytics, Offers, Sales, Newsletter | Placeholder routes from pre-7.5 admin shell — not PostgreSQL modules |
| Notification delete | Permanent delete (no soft-delete) — acceptable for admin alerts |
| Customer role filter | Only `CUSTOMER` role shown by design; admins/sellers excluded intentionally |

---

## 9. Files Changed

```
backend/src/services/adminDashboardService.js   — inventory auto-create
backend/src/services/adminNotificationService.js — delete notification
backend/src/controllers/adminNotificationController.js
backend/src/routes/adminRoutes.js

src/services/adminApiService.js                 — customers/inventory mapping, delete notification
src/components/EcommerceAdmin/EcomSidebar.jsx   — sidebar rewrite
src/components/EcommerceAdmin/EcomSidebar.css   — mobile-only
src/components/EcommerceAdmin/AdminNotificationsView.jsx
src/components/EcommerceAdmin/AdminCustomersView.jsx
src/components/EcommerceAdmin/AdminInventoryView.jsx
src/styles/admin-design-system.css              — sidebar + notifications list
src/App.jsx                                     — notifications route
```

---

## Manual Testing Checklist

- [ ] Sidebar: no overlapping badge on logo; full height; footer pinned
- [ ] Sidebar: click Notifications → dedicated page (no inline panel)
- [ ] Customers page shows registered CUSTOMER users
- [ ] Customers empty state when DB has no customers
- [ ] Inventory page shows all products with stock/reserved/available
- [ ] Products missing inventory rows get default inventory on load
- [ ] Notifications: filter, mark read, mark all read, delete, detail drawer
- [ ] Orders, Support, Wishlists, Settings still load correctly
