# LIT Marketplace — Database ER Diagram

This document describes the PostgreSQL schema for the LIT marketplace, including implemented tables and planned commerce tables.

## Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Address : has
    User ||--o| Cart : owns
    User ||--o| Wishlist : owns

    Cart ||--o{ CartItem : contains
    Wishlist ||--o{ WishlistItem : contains

    Category ||--o{ Product : classifies
    Product ||--o{ ProductImage : has
    Product ||--o| ProductInventory : tracks
    Product ||--o{ CartItem : referenced_by
    Product ||--o{ WishlistItem : referenced_by

    User ||--o{ Order : places
    Order ||--o{ OrderItem : contains
    Product ||--o{ OrderItem : sold_as
    Order ||--o| Payment : settled_by
    User ||--o{ Review : writes
    Product ||--o{ Review : receives
    Order ||--o{ Review : validates
    Coupon ||--o{ Order : applied_to

    User {
        uuid id PK
        string azureUserId UK
        string email UK
        string displayName
        enum role
        boolean isActive
        datetime createdAt
        datetime lastLogin
    }

    Address {
        uuid id PK
        uuid userId FK
        string fullName
        string addressLine1
        string city
        string country
        enum addressType
        boolean isDefault
    }

    Category {
        uuid id PK
        string name
        string slug UK
        string imageUrl
        boolean isActive
        int displayOrder
    }

    Product {
        uuid id PK
        uuid categoryId FK
        string name
        string slug UK
        string sku UK
        decimal price
        enum status
        boolean isFeatured
    }

    ProductImage {
        uuid id PK
        uuid productId FK
        string imageUrl
        int sortOrder
        boolean isPrimary
    }

    ProductInventory {
        uuid id PK
        uuid productId FK UK
        int quantity
        int reservedQuantity
        int lowStockThreshold
    }

    Cart {
        uuid id PK
        uuid userId FK UK
    }

    CartItem {
        uuid id PK
        uuid cartId FK
        uuid productId FK
        int quantity
    }

    Wishlist {
        uuid id PK
        uuid userId FK UK
    }

    WishlistItem {
        uuid id PK
        uuid wishlistId FK
        uuid productId FK
    }

    Order {
        uuid id PK
        uuid userId FK
        uuid addressId FK
        enum status
        decimal totalAmount
        datetime createdAt
    }

    OrderItem {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        int quantity
        decimal unitPrice
    }

    Payment {
        uuid id PK
        uuid orderId FK UK
        enum status
        decimal amount
        string provider
    }

    Review {
        uuid id PK
        uuid userId FK
        uuid productId FK
        uuid orderId FK
        int rating
        string comment
    }

    Coupon {
        uuid id PK
        string code UK
        enum discountType
        decimal discountValue
        boolean isActive
    }
```

## Implemented Tables

### Users
Stores authenticated marketplace users synced from Azure External ID.

| Relationship | Description |
|---|---|
| User → Address (1:N) | A user can save multiple shipping/billing addresses. Deleting a user cascades to addresses. |
| User → Cart (1:1) | Each user has at most one active cart. |
| User → Wishlist (1:1) | Each user has at most one wishlist. |

### Addresses
Shipping and billing addresses linked to a user. One address may be marked default per user.

### Categories
Product taxonomy with slug, display order, active flag, and optional image URL.

| Relationship | Description |
|---|---|
| Category → Product (1:N) | Products belong to one category. Category deletion is restricted while products exist. |

### Products
Core catalog entity with pricing, SKU, brand, status, and merchandising flags.

| Relationship | Description |
|---|---|
| Product → ProductImage (1:N) | Multiple images per product; one may be primary. Images cascade on product delete. |
| Product → ProductInventory (1:1) | Stock levels and low-stock threshold per product. |
| Product → CartItem (1:N) | Cart line items reference products. |
| Product → WishlistItem (1:N) | Wishlist entries reference products. |

### ProductImages
Image metadata with URL storage (Azure Blob Storage ready). Supports sort order and primary flag.

### ProductInventory
Tracks on-hand quantity, reserved quantity, and low-stock threshold.

### Cart / CartItems
Persistent server-side cart per authenticated user.

| Relationship | Description |
|---|---|
| Cart → CartItem (1:N) | Cart contains line items with quantity. Unique constraint on `(cartId, productId)`. |

### Wishlist / WishlistItems
Saved products per authenticated user.

| Relationship | Description |
|---|---|
| Wishlist → WishlistItem (1:N) | Unique constraint on `(wishlistId, productId)`. |

## Phase 6 — Orders & Payments (Implemented)

Migration: `20250623160000_add_orders_payments`

```mermaid
erDiagram
    User ||--o{ Order : places
    Order ||--o{ OrderItem : contains
    Order ||--o| OrderShippingAddress : snapshots
    Order ||--o{ OrderStatusHistory : tracks
    Order ||--o{ PaymentIntent : initiates
    PaymentIntent ||--o{ PaymentTransaction : records
    Product ||--o{ OrderItem : sold_as

    Order {
        uuid id PK
        uuid userId FK
        string orderNumber UK
        decimal subtotal
        decimal shippingCharge
        decimal tax
        decimal discount
        decimal grandTotal
        enum paymentStatus
        enum orderStatus
        string paymentMethod
        enum deliveryMethod
        string trackingNumber
        datetime createdAt
    }

    OrderItem {
        uuid id PK
        uuid orderId FK
        uuid productId FK
        string productNameSnapshot
        string skuSnapshot
        decimal priceSnapshot
        int quantity
        decimal subtotal
    }

    OrderShippingAddress {
        uuid id PK
        uuid orderId FK UK
        string fullName
        string addressLine1
        string city
        string country
    }

    OrderStatusHistory {
        uuid id PK
        uuid orderId FK
        enum status
        datetime createdAt
    }

    PaymentIntent {
        uuid id PK
        uuid orderId FK
        uuid userId FK
        enum provider
        enum status
        decimal amount
    }

    PaymentTransaction {
        uuid id PK
        uuid paymentIntentId FK
        enum provider
        enum status
        string providerTxnId
    }
```

| Relationship | Description |
|---|---|
| User → Order (1:N) | Customer order history via `orders.user_id`. |
| Order → OrderShippingAddress (1:1) | Immutable shipping snapshot — not a live address FK. |
| Order → OrderItem (1:N) | Line items with price/name/SKU snapshots. |
| Order → OrderStatusHistory (1:N) | Lifecycle audit trail with timestamps. |
| Order → PaymentIntent (1:N) | Payment attempts per order. |
| PaymentIntent → PaymentTransaction (1:N) | Provider transaction records. |

Inventory is decremented atomically in a Prisma transaction when an order is placed; restored on cancellation.

## Planned Tables (Future)

### Reviews
Product reviews tied to verified purchases.

| Relationship | Description |
|---|---|
| User → Review (1:N) | A user may review multiple products. |
| Product → Review (1:N) | Aggregate rating source for products. |
| Order → Review (0:1) | Optional link to verify purchase. |

### Coupons
Promotional codes applied during checkout.

| Relationship | Description |
|---|---|
| Coupon → Order (1:N) | Orders may reference an applied coupon code. |

### AdminUsers / Roles
Admin access is currently modeled via `User.role = ADMIN` in the existing `users` table rather than a separate admin table. A dedicated `AdminUser` join table may be added later for multi-role enterprise scenarios.

## Image Storage

Product and category images store URLs in PostgreSQL (`image_url` columns). The service layer is designed to accept URL strings today and can be extended to upload to Azure Blob Storage without schema changes.

## Migration Notes

Shopping tables were added in migration `20250623140000_add_cart_wishlist`.

Run:

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:generate
```
