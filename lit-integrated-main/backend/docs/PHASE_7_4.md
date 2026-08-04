# Phase 7.4 — Shopping Experience, Auth UX & Order Management

Phase 7.4 extends the LIT marketplace with premium authentication UX, Buy Now checkout sessions, Pinterest-style wishlist collections, guided order cancellation, animated order timelines, customer support integration, admin visibility, and PostgreSQL persistence.

## Database Migration

**Migration:** `20250623190000_phase_7_4_shopping_experience`

### New / Updated Tables

| Table | Purpose |
|-------|---------|
| `wishlist_collections` | Named collections under a user wishlist |
| `wishlist_items` | Items linked to `collection_id` (migrated from flat wishlist) |
| `order_cancellation_reasons` | Structured cancel reason + optional text |
| `support_requests` | Customer support submissions |

### Enums

- `CancellationReasonCode`: `CHANGED_MIND`, `BETTER_PRICE`, `ORDERED_BY_MISTAKE`, `DELIVERY_TOO_SLOW`, `PAYMENT_ISSUE`, `DIFFERENT_PRODUCT`, `OTHER`
- `SupportRequestType`: `GENERAL`, `CHAT`, `RETURN`, `SHIPPING`, `ORDER`
- `SupportRequestStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

Deploy:

```powershell
cd backend
npm run prisma:migrate:deploy
npm run prisma:generate
```

---

## Part 1 — Authentication Experience

### Frontend

- `src/components/AuthModal/AuthModal.jsx` — full-screen glassmorphism modal
- `src/context/AuthModalContext.jsx` — premium auth-required dialog
- `src/components/UserProtectedRoute.jsx` — no blank pages on protected routes
- `src/pages/AuthCallback.jsx` — branded callback with loading states

### Behaviour

When auth is required, users see:

> Sign in to continue your luxury shopping experience.

Actions: **Sign In**, **Create Account**, **Continue Browsing**

---

## Part 2 — Buy Now Logic

Buy Now creates a **temporary checkout session** without modifying the saved cart.

### API

**GET** `/api/checkout?checkoutMode=buy_now&productId={uuid}&quantity=1`

**POST** `/api/orders`

```json
{
  "checkoutMode": "buy_now",
  "buyNow": { "productId": "uuid", "quantity": 1 },
  "addressId": "uuid",
  "deliveryMethod": "STANDARD",
  "paymentProvider": "MOCK",
  "paymentMethod": "mock_card"
}
```

### Frontend

- `ShoppingContext.buyNow()` navigates to `/shop/checkout?mode=buy_now&productId=...&quantity=...`
- `MarketplaceCheckoutPage.jsx` reads query params and passes `checkoutMode` / `buyNow` to checkout APIs
- Cart remains unchanged after successful Buy Now order

---

## Part 3 — Wishlist Collections

### Customer APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/wishlist/collections` | List collections |
| POST | `/api/wishlist/collections` | Create collection |
| PATCH | `/api/wishlist/collections/:id` | Rename collection |
| DELETE | `/api/wishlist/collections/:id` | Delete (not default) |
| PATCH | `/api/wishlist/collections/:id/default` | Set default |
| POST | `/api/wishlist/items/:productId` | Add to collection |
| POST | `/api/wishlist/items/:productId/move` | Move between collections |
| POST | `/api/wishlist/items/:productId/copy` | Copy between collections |

### Frontend

- `WishlistCollectionPicker.jsx` — heart icon opens collection picker
- `Wishlist.jsx` — sidebar collections, create/rename/delete, move/copy

Existing flat wishlist items were migrated into a default **Favorites** collection.

---

## Part 4 — Order Cancellation

### API

**PATCH** `/api/orders/:id/cancel`

```json
{
  "reasonCode": "CHANGED_MIND",
  "reasonText": "Optional when reasonCode is OTHER"
}
```

Persists `order_cancellation_reasons`, updates order status, writes audit log, notifies admin.

### Frontend

- `CancelOrderModal.jsx` — confirm → reason → need help? → submit
- `OrderDetailsPage.jsx` — integrated modal + support shortcuts

---

## Part 5 — Order Timeline

- `DeliveryTimeline.jsx` — 6-step lifecycle with timestamps from `statusHistory`
- Steps: Ordered → Confirmed → Packed → Shipped → Out For Delivery → Delivered (or Cancelled)

---

## Part 6 — Support Integration

### Customer API

**POST** `/api/support/requests`

```json
{
  "orderId": "uuid (optional)",
  "type": "GENERAL | CHAT | RETURN | SHIPPING | ORDER",
  "subject": "string",
  "message": "string"
}
```

Order detail page includes **Need Help?** cards: Contact Support, Return Policy, Shipping Policy, FAQ, Chat (placeholder).

---

## Part 7 — Admin (Part 8)

| Endpoint | Description |
|----------|-------------|
| GET `/api/admin/support/requests` | Support request inbox |
| GET `/api/admin/wishlists/collections` | Read-only wishlist collections |

Admin order drawer shows **Cancellation Reason** when present.

Admin sidebar: **Support**, **Wishlists**

---

## Part 9 — Notifications

Admin notifications fire on:

- Order cancelled (existing + reason)
- Support request created (`SUPPORT_REQUEST`)

---

## Manual Testing Checklist

### Authentication

- [ ] Open protected route while logged out → premium dialog (not blank page)
- [ ] Sign In / Create Account / Continue Browsing all work
- [ ] Auth callback shows branded loading/success states

### Buy Now

- [ ] Add 5 items to cart
- [ ] Click Buy Now on a different product (product page, card, search, featured)
- [ ] Checkout shows **only** that product
- [ ] Place order → cart still has original 5 items
- [ ] Buy Now banner visible on checkout

### Wishlist Collections

- [ ] Heart opens collection picker
- [ ] Create new collection from picker
- [ ] Wishlist page: create, rename, delete, set default
- [ ] Move and copy products between collections
- [ ] Default collection cannot be deleted

### Order Cancellation

- [ ] Cancel eligible order → guided modal
- [ ] Select each reason; Other requires textarea
- [ ] Chat Support / Contact Support creates support request
- [ ] Continue Cancellation saves reason and cancels order
- [ ] Admin sees cancellation reason in order drawer

### Order Timeline

- [ ] Active order shows animated 6-step timeline with timestamps
- [ ] Cancelled order shows cancelled state

### Support

- [ ] Order page Need Help links work
- [ ] Support request from cancel flow appears in admin Support view
- [ ] Admin notification created for support request

### Admin

- [ ] `/admin/ecomDashboard/support` lists requests
- [ ] `/admin/ecomDashboard/wishlists` lists collections (read-only)

### Regression

- [ ] Normal cart checkout still works
- [ ] Existing wishlist/cart APIs unchanged for clients not sending new fields
- [ ] Admin portal Phase 7.3 features still work

---

## Key Files

```
backend/prisma/migrations/20250623190000_phase_7_4_shopping_experience/
backend/src/services/orderService.js
backend/src/services/wishlistService.js
backend/src/services/supportService.js
backend/src/controllers/adminSupportController.js
backend/src/controllers/adminWishlistController.js

src/components/AuthModal/
src/components/wishlist/WishlistCollectionPicker.jsx
src/components/order-returns/CancelOrderModal/
src/components/order-returns/DeliveryTimeline/
src/pages/marketplace/MarkplaceCheckoutPage.jsx
src/pages/Wishlist.jsx
src/pages/OrderDetailsPage/OrderDetailsPage.jsx
src/components/EcommerceAdmin/AdminSupportView.jsx
src/components/EcommerceAdmin/AdminWishlistCollectionsView.jsx
```
