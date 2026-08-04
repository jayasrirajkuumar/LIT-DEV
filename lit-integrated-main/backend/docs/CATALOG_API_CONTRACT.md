# LIT Catalog API Contract — Phase 3

Base URL: `http://localhost:3001/api`

---

## Categories (Public)

### GET /api/categories

List active categories sorted by `displayOrder`.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Luxury Fashion",
        "slug": "luxury-fashion",
        "description": "...",
        "imageUrl": "https://...",
        "isActive": true,
        "displayOrder": 1,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

### GET /api/categories/:slug

**Response 200:** `{ "success": true, "data": { "category": { ..., "productCount": 12 } } }`

---

## Products (Public)

### GET /api/products

Query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `category` | slug | — | Filter by category slug |
| `brand` | string | — | Exact brand match (case-insensitive) |
| `minPrice` | number | — | Minimum price |
| `maxPrice` | number | — | Maximum price |
| `availability` | enum | `all` | `all`, `in_stock`, `out_of_stock`, `low_stock` |
| `sort` | enum | `newest` | `newest`, `price_asc`, `price_desc`, `popularity` |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "products": [ { "...product" } ],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
  }
}
```

### GET /api/products/featured?limit=12

Featured active products sorted by popularity.

### GET /api/products/new-arrivals?limit=12

Newest active products.

### GET /api/products/search?q=burberry

Same filters as list endpoint plus required `q` search term.

### GET /api/products/category/:slug

Products in category with pagination/filters.

### GET /api/products/:slug

Single active product detail. Increments `viewCount` for popularity sorting.

**Product object includes:**

```json
{
  "id": "uuid",
  "name": "Quilted Jacket",
  "slug": "quilted-jacket",
  "brand": "Burberry",
  "price": "49077.00",
  "comparePrice": "163590.00",
  "currency": "INR",
  "stockQuantity": 25,
  "inventory": {
    "quantity": 25,
    "reservedQuantity": 0,
    "lowStockThreshold": 5,
    "availableQuantity": 25,
    "isInStock": true,
    "isLowStock": false
  },
  "images": [],
  "primaryImage": "https://..."
}
```

---

## Admin (Protected)

Requires:

```
Authorization: Bearer <azure_id_token>
```

User must have `role: ADMIN` in database.

### POST /api/admin/categories

```json
{
  "name": "Luxury Fashion",
  "slug": "luxury-fashion",
  "description": "Premium designer pieces",
  "imageUrl": "https://...",
  "isActive": true,
  "displayOrder": 1
}
```

### PATCH /api/admin/categories/:id

Partial update. Same fields as create.

### DELETE /api/admin/categories/:id

Fails with `409 CATEGORY_HAS_PRODUCTS` if products exist.

### POST /api/admin/products

```json
{
  "categoryId": "uuid",
  "name": "Quilted Jacket",
  "slug": "quilted-jacket",
  "shortDescription": "Heritage beige quilted jacket",
  "description": "Full description...",
  "sku": "BUR-JKT-001",
  "brand": "Burberry",
  "price": 49077,
  "comparePrice": 163590,
  "currency": "INR",
  "status": "ACTIVE",
  "weight": 1.2,
  "dimensions": { "length": 70, "width": 50, "height": 5, "unit": "cm" },
  "isFeatured": true,
  "inventory": {
    "quantity": 25,
    "reservedQuantity": 0,
    "lowStockThreshold": 5
  },
  "images": [
    {
      "imageUrl": "https://cdn.example.com/jacket.jpg",
      "altText": "Burberry quilted jacket",
      "sortOrder": 0,
      "isPrimary": true
    }
  ]
}
```

### PATCH /api/admin/products/:id

Partial update. Supports nested `inventory` and `images` replacement.

### DELETE /api/admin/products/:id

Soft delete — sets status to `ARCHIVED`.

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `CATEGORY_NOT_FOUND` | 404 | Category missing or inactive |
| `PRODUCT_NOT_FOUND` | 404 | Product missing or not public |
| `SLUG_ALREADY_EXISTS` | 409 | Duplicate slug |
| `SKU_ALREADY_EXISTS` | 409 | Duplicate SKU |
| `CATEGORY_HAS_PRODUCTS` | 409 | Cannot delete category |
| `FORBIDDEN` | 403 | Non-admin access to admin route |
| `VALIDATION_ERROR` | 400 | Invalid input |

---

## React Service

```javascript
import {
  getCategories,
  getProducts,
  getProductBySlug,
  searchProducts,
  getFeaturedProducts,
} from "./services/catalogApiService";
```
