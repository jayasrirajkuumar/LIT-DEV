# LIT API Contract — Phase 2: User Profile & Addresses

All endpoints require:

```
Authorization: Bearer <azure_id_token>
```

Base URL: `http://localhost:3001/api` (dev)

---

## Authentication (Phase 1 — unchanged)

### POST /api/auth/sync-user

See Phase 1 contract. Must be called after Azure login before profile/address APIs.

**User response now includes `phoneNumber`:**

```json
{
  "id": "uuid",
  "azureUserId": "azure-sub",
  "email": "user@example.com",
  "displayName": "Jane Doe",
  "phoneNumber": null,
  "profilePicture": null,
  "role": "CUSTOMER",
  "isActive": true,
  "createdAt": "2025-06-23T10:00:00.000Z",
  "updatedAt": "2025-06-23T10:00:00.000Z",
  "lastLogin": "2025-06-23T10:00:00.000Z"
}
```

---

## User Profile

### GET /api/users/me

Returns the authenticated user's profile.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "azureUserId": "azure-sub",
      "email": "user@example.com",
      "displayName": "Jane Doe",
      "phoneNumber": "+919876543210",
      "profilePicture": "https://cdn.example.com/avatars/jane.jpg",
      "role": "CUSTOMER",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "...",
      "lastLogin": "..."
    }
  }
}
```

---

### PATCH /api/users/me

Update profile fields. **Email cannot be changed.**

**Request body:**

```json
{
  "displayName": "Jane Doe",
  "phoneNumber": "+919876543210",
  "profilePicture": "https://cdn.example.com/avatars/jane.jpg"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `displayName` | Yes | 1–255 characters |
| `phoneNumber` | No | Max 20 chars, nullable |
| `profilePicture` | No | Valid URL, max 2048 chars, nullable |

**Response 200:** Same shape as GET /api/users/me

**Errors:**

| Code | HTTP | When |
|------|------|------|
| `EMAIL_READ_ONLY` | 400 | `email` sent in body |
| `VALIDATION_ERROR` | 400 | Invalid field values |
| `USER_NOT_FOUND` | 404 | User not synced |
| `USER_INACTIVE` | 403 | Account deactivated |

---

## Addresses

### GET /api/addresses

List all addresses for the authenticated user (default first).

**Response 200:**

```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "id": "uuid",
        "userId": "uuid",
        "fullName": "Jane Doe",
        "phone": "+919876543210",
        "addressLine1": "12 MG Road",
        "addressLine2": "Apt 4B",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560001",
        "country": "India",
        "addressType": "HOME",
        "isDefault": true,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

### GET /api/addresses/:id

**Response 200:** `{ "success": true, "data": { "address": { ... } } }`

**Errors:** `ADDRESS_NOT_FOUND` (404) if not owned by user

---

### POST /api/addresses

**Request body:**

```json
{
  "fullName": "Jane Doe",
  "phone": "+919876543210",
  "addressLine1": "12 MG Road",
  "addressLine2": "Apt 4B",
  "city": "Bengaluru",
  "state": "Karnataka",
  "postalCode": "560001",
  "country": "India",
  "addressType": "HOME",
  "isDefault": true
}
```

| Field | Required | Values |
|-------|----------|--------|
| `addressType` | Yes | `HOME`, `OFFICE`, `OTHER` |
| `isDefault` | No | Default `false`; first address auto-defaults |

**Response 201:** Created address

**Default behavior:** Setting `isDefault: true` unsets all other defaults for the user.

---

### PATCH /api/addresses/:id

Partial update. At least one field required.

```json
{
  "city": "Mumbai",
  "isDefault": true
}
```

**Response 200:** Updated address

---

### DELETE /api/addresses/:id

**Response 200:** Deleted address object

If deleted address was default, the most recent remaining address becomes default.

---

## Frontend Service (React)

```javascript
import {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "./services/userApiService";

// Uses localStorage id_token automatically
const profile = await getProfile();
await updateProfile({ displayName: "Jane", phoneNumber: "+91..." });
const addresses = await getAddresses();
```

---

## Common Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```
