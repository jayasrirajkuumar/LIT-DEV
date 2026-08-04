# LIT Marketplace — Checkout, Orders & Payments (Phase 6)

## Checkout Flow

1. User adds items to cart (`ShoppingContext` → `/api/cart`)
2. User opens `/shop/checkout`
3. **Shipping** — select saved address or add new (`/api/addresses`)
4. **Delivery** — STANDARD (₹99) or EXPRESS (₹199)
5. **Review** — cart items, tax (18% placeholder), coupon/gift/notes placeholders
6. **Payment** — mock provider captures payment
7. **Success** — order persisted, cart cleared, inventory reduced

## API Endpoints

All require Azure auth (`Authorization: Bearer <id_token>`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/checkout` | Checkout preview (cart, addresses, totals) |
| POST | `/api/checkout` | Recalculate preview with body overrides |
| POST | `/api/orders` | Place order + mock payment |
| GET | `/api/orders` | List authenticated user's orders |
| GET | `/api/orders/history` | Alias of order list |
| GET | `/api/orders/:id` | Order detail |
| PATCH | `/api/orders/:id/cancel` | Cancel order + restore inventory |
| POST | `/api/orders/:id/reorder` | Add order items back to cart |

### Admin (requires `User.role = ADMIN`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/orders` | List/search/filter orders |
| GET | `/api/admin/orders/stats` | Count by status |
| GET | `/api/admin/orders/export` | CSV export |
| GET | `/api/admin/orders/:id` | Order detail with customer |
| PATCH | `/api/admin/orders/:id/status` | Update lifecycle status |
| PATCH | `/api/admin/orders/:id/tracking` | Assign tracking number |
| PATCH | `/api/admin/orders/:id/notes` | Internal admin notes |

## Order Lifecycle

`PENDING → CONFIRMED → PROCESSING → PACKED → SHIPPED → OUT_FOR_DELIVERY → DELIVERED`

Terminal/alternate paths: `CANCELLED`, `RETURNED`, `REFUNDED`

Every transition is stored in `order_status_history` with timestamp.

## Payment Architecture

```
orderService.createOrder()
  → getPaymentProvider("MOCK" | "RAZORPAY" | "STRIPE")
    → provider.createIntent()
    → provider.capturePayment()
  → payment_intents + payment_transactions tables
```

- **MOCK** — fully implemented (development)
- **RAZORPAY** — adapter stub; swap in real SDK later
- **STRIPE** — adapter stub for future use

## Notifications (Placeholders)

`notificationService` logs placeholders for:

- Order placed
- Payment success
- Order shipped
- Order delivered

Email/SMS integration can plug into this service later.

## Testing Checklist

### Checkout
- [ ] Add items to cart while signed in
- [ ] Open `/shop/checkout`
- [ ] Select saved address or add new address
- [ ] Choose delivery method — totals update
- [ ] Place mock payment — success screen shows order number
- [ ] Cart is empty after order
- [ ] `orders`, `order_items`, `order_shipping_addresses` rows in PostgreSQL
- [ ] Inventory quantity decreased

### My Orders
- [ ] `/orders` lists placed orders
- [ ] Search by order number works
- [ ] Filter tabs work (All, On the Way, Delivered, etc.)
- [ ] Order detail shows timeline, shipping snapshot, pricing
- [ ] Cancel order restores inventory
- [ ] Reorder adds items to cart

### Admin
- [ ] `/admin/ecomDashboard/orders` loads order table
- [ ] Status cards show counts
- [ ] Update status adds history entry
- [ ] Tracking number saves
- [ ] Internal notes save
- [ ] CSV export downloads

### Security
- [ ] User A cannot view User B's order by ID
- [ ] Non-admin cannot access `/api/admin/orders`

## Migration

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:generate
npm run dev
```
