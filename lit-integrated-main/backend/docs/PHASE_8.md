# Phase 8 — Marketplace UI Redesign

Darveys-inspired luxury marketplace refresh covering navbar, catalog UX, admin tooling, coupons, order tracking, and support management.

## 1. Files Modified

### Backend
- `backend/prisma/schema.prisma` — announcements, brands, sort/filter options, coupons, support replies
- `backend/prisma/migrations/20250628120000_marketplace_phase_8/migration.sql`
- `backend/src/routes/userRoutes.js` — `GET /users/me/coupons`
- `backend/src/routes/adminRoutes.js` — marketplace admin, carts, wishlist items, support replies
- `backend/src/routes/marketplaceRoutes.js` — public config
- `backend/src/routes/index.js`
- `backend/src/controllers/marketplaceController.js`
- `backend/src/controllers/marketplaceAdminController.js`
- `backend/src/controllers/adminSupportController.js`
- `backend/src/services/marketplaceConfigService.js`
- `backend/src/services/couponService.js`
- `backend/src/services/authService.js` — welcome coupon on signup
- `backend/src/services/supportService.js`
- `backend/src/services/productService.js` — featured sort/filter
- `backend/src/repositories/productRepository.js` — discount/featured sort
- `backend/src/utils/orderCancelHelpers.js`
- `backend/src/utils/orderMappers.js`
- `backend/src/constants/defaultStoreSettings.js` — `welcomeCoupon` section

### Frontend
- `src/App.jsx` — gift cards route, admin routes
- `src/components/Newsletter-components/Navbar/Navbar.jsx` — Marketplace label, guest-only nav
- `src/components/marketplace/*` — announcement bar, navbar, brands, layout, catalog toolbar/filters
- `src/pages/marketplace/*` — shop home, gift cards, catalog filters hook
- `src/pages/profile/Profile/*` — removed online status, coupons section
- `src/pages/OrderDetailsPage/*` — cancel window UI
- `src/components/order-returns/DeliveryTimeline/*` — 6-step stepper
- `src/components/EcommerceAdmin/*` — carts, wishlist items, marketplace config, support drawer
- `src/services/marketplaceApiService.js`, `adminApiService.js`
- `src/hooks/useMarketplaceConfig.js`
- `src/styles/design-system.css`, `marketplace.css`, `admin-design-system.css`
- `src/pages/ShoppingCartPage.*`, `Wishlist.jsx`

## 2. New APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/marketplace/config` | Public announcements, brands, sort/filter options |
| GET | `/api/users/me/coupons` | Authenticated user coupons |
| GET | `/api/admin/marketplace/config` | Admin marketplace config |
| POST/PATCH/DELETE | `/api/admin/marketplace/announcements` | Announcement CRUD |
| POST/PATCH/DELETE | `/api/admin/marketplace/brands` | Brand CRUD |
| PATCH | `/api/admin/marketplace/sort-options/:id` | Enable/disable sort options |
| PATCH | `/api/admin/marketplace/filter-options/:id` | Enable/disable filter options |
| GET | `/api/admin/carts` | Admin cart management |
| GET | `/api/admin/wishlist-items` | Admin wishlist item list |
| GET | `/api/admin/support/requests/:id` | Ticket detail + reply history |
| POST | `/api/admin/support/requests/:id/reply` | Email reply (stored) |
| PATCH | `/api/admin/support/requests/:id/status` | Update ticket status |

Order APIs now return `canCancel`, `cancelWindowExpired`, `cancelWindowMinutes` (30-minute window enforced server-side).

## 3. Database Changes

Migration `20250628120000_marketplace_phase_8` adds:

- `marketplace_announcements`
- `marketplace_brands`
- `marketplace_sort_options` (seeded: newest, popularity, price asc/desc, discount, featured)
- `marketplace_filter_options` (seeded: category, brand, gender, kids, color, size, price, discount, availability, rating, material, collections)
- `coupons` (+ `CouponType`, `CouponSource` enums)
- `support_request_replies`

Store settings JSON gains `welcomeCoupon`: `{ enabled, amount, expiryDays, prefix }`.

## 4. Admin Pages Created

| Route | Component |
|-------|-----------|
| `/admin/ecomDashboard/carts` | `AdminCartsView` |
| `/admin/ecomDashboard/wishlist-items` | `AdminWishlistItemsView` |
| `/admin/ecomDashboard/marketplace` | `AdminMarketplaceView` |

Enhanced: `AdminSupportView` (drawer, replies, status), `AdminSettingsView` (welcome coupon section).

## 5. Components Created

- `MarketplaceAnnouncementBar`
- `MarketplaceNavbar`
- `MarketplaceBrandsSection`
- `ProfileCouponsSection`
- `GiftCardsPage`
- `AdminCartsView`
- `AdminWishlistItemsView`
- `AdminMarketplaceView`
- `useMarketplaceConfig` hook

## 6. Migration Steps

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Frontend:

```bash
cd ..   # project root with package.json
npm install
npm run dev
```

Ensure `VITE_USER_API_BASE_URL` points to the backend (`http://localhost:3001/api`).

## 7. Testing Checklist

### Part 1 — Navbar
- [ ] Home navbar shows "Marketplace" (not Store)
- [ ] Guest sees only Notifications + Sign In (no wishlist/cart)
- [ ] Logged-in user sees wishlist/cart on marketplace navbar

### Part 2 — Marketplace UI
- [ ] Announcement bar rotates messages from API
- [ ] Sticky Darveys-style navbar with categories + search
- [ ] Hero shows Men / Women / Kids equal height
- [ ] Brands carousel loads from API
- [ ] Fresh Arrivals section renders with hover cards

### Part 3 — Profile
- [ ] Online status badge removed

### Part 4 — Theme
- [ ] Purple primary / lavender secondary buttons
- [ ] No bright yellow on cart/wishlist/marketplace accents

### Part 5 — Welcome Coupon
- [ ] Admin settings: enable/disable, amount, expiry, prefix
- [ ] New signup receives coupon (not hardcoded amount)
- [ ] Coupon appears on profile page

### Part 6 — Wishlist & Cart
- [ ] Luxury styling on icons, buttons, empty states, quantity controls

### Part 7 — Order Progress
- [ ] 6-step animated stepper on order details

### Part 8 — Cancellation
- [ ] Cancel visible within 30 minutes
- [ ] After 30 minutes: message shown, button hidden
- [ ] Backend rejects late cancellation

### Part 9 — Sort & Filter
- [ ] Sort dropdown loads from backend
- [ ] Filter accordion loads enabled filters from backend
- [ ] Admin can toggle sort/filter options

### Part 10 — Admin
- [ ] Carts page lists users, products, quantities, subtotals
- [ ] Wishlist items page lists user, product, date, links

### Part 11 — Support
- [ ] Admin opens ticket, reads messages, views user details
- [ ] Reply stored in history; status updates (Open/In Progress/Resolved/Closed)

### General
- [ ] `/shop/gift-cards` placeholder page loads
- [ ] Responsive layout on mobile/tablet
- [ ] Existing checkout, cart, wishlist, orders still work
