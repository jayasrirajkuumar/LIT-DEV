# LIT Backend — Testing Checklist (Phase 2)

## Prerequisites

- [ ] `backend/.env` configured with valid `DATABASE_URL`
- [ ] `npm install` completed in `backend/`
- [ ] `npm run prisma:migrate:deploy` applied both migrations
- [ ] `npm run verify:foundation` passes all checks
- [ ] Backend running: `npm run dev` on port 3001
- [ ] Valid Azure ID token available (sign in via frontend, copy from DevTools → Application → localStorage → `id_token`)

Set token for curl tests:

```bash
export ID_TOKEN="<paste id_token>"
export API=http://localhost:3001/api
```

---

## Part 1 — Foundation Verification

| # | Test | Expected | Pass |
|---|------|----------|------|
| 1 | `GET /api/health` | `{ database: "connected" }` | ☐ |
| 2 | `npm run verify:foundation` | All checks pass | ☐ |
| 3 | `POST /api/auth/sync-user` (new user) | HTTP 201, `isNewUser: true` | ☐ |
| 4 | `POST /api/auth/sync-user` (returning user) | HTTP 200, `lastLogin` updated | ☐ |
| 5 | Invalid token on sync | HTTP 401 `INVALID_TOKEN` | ☐ |

---

## Part 2 — User Profile

| # | Test | Expected | Pass |
|---|------|----------|------|
| 6 | `GET /api/users/me` | Returns user with email, displayName | ☐ |
| 7 | `PATCH /api/users/me` with valid displayName | HTTP 200, fields updated | ☐ |
| 8 | `PATCH /api/users/me` with phoneNumber | phoneNumber persisted | ☐ |
| 9 | `PATCH /api/users/me` with profilePicture URL | URL stored | ☐ |
| 10 | `PATCH /api/users/me` without displayName | HTTP 400 validation error | ☐ |
| 11 | `PATCH /api/users/me` with `email` field | HTTP 400 `EMAIL_READ_ONLY` | ☐ |
| 12 | `GET /api/users/me` without token | HTTP 401 | ☐ |
| 13 | Re-login after profile update | Profile fields preserved (not overwritten by sync) | ☐ |

### Sample curl

```bash
curl -s "$API/users/me" -H "Authorization: Bearer $ID_TOKEN" | jq

curl -s -X PATCH "$API/users/me" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Jane Doe","phoneNumber":"+919876543210"}' | jq
```

---

## Part 3 — Address Management

| # | Test | Expected | Pass |
|---|------|----------|------|
| 14 | `GET /api/addresses` (empty) | `{ addresses: [] }` | ☐ |
| 15 | `POST /api/addresses` first address | HTTP 201, `isDefault: true` auto-set | ☐ |
| 16 | `POST /api/addresses` second with `isDefault: true` | Only one default remains | ☐ |
| 17 | `GET /api/addresses/:id` | Returns owned address | ☐ |
| 18 | `GET /api/addresses/:id` (other user's id) | HTTP 404 | ☐ |
| 19 | `PATCH /api/addresses/:id` | Fields updated | ☐ |
| 20 | `PATCH /api/addresses/:id` set `isDefault: true` | Previous default unset | ☐ |
| 21 | `DELETE /api/addresses/:id` (default) | Next address promoted to default | ☐ |
| 22 | `POST /api/addresses` invalid body | HTTP 400 validation error | ☐ |

### Sample curl

```bash
curl -s -X POST "$API/addresses" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Jane Doe",
    "phone":"+919876543210",
    "addressLine1":"12 MG Road",
    "city":"Bengaluru",
    "state":"Karnataka",
    "postalCode":"560001",
    "country":"India",
    "addressType":"HOME",
    "isDefault":true
  }' | jq
```

---

## Part 4 — Security

| # | Test | Expected | Pass |
|---|------|----------|------|
| 23 | Access `/api/users/me` with expired token | HTTP 401 | ☐ |
| 24 | Rate limit auth endpoints (>30/15min) | HTTP 429 | ☐ |
| 25 | Cannot access another user's address by UUID | HTTP 404 | ☐ |
| 26 | SQL injection in displayName | Safely rejected / escaped | ☐ |

---

## Part 5 — Frontend API Service

| # | Test | Expected | Pass |
|---|------|----------|------|
| 27 | `getProfile()` in browser console | Returns profile object | ☐ |
| 28 | `updateProfile()` | Navbar/profile name updates (when wired) | ☐ |
| 29 | `getAddresses()` / `createAddress()` | Address list reflects API data | ☐ |
| 30 | `deleteAddress()` | Address removed from list | ☐ |

---

## Regression — Phase 1 Auth (unchanged)

| # | Test | Expected | Pass |
|---|------|----------|------|
| 31 | Auth flow still uses PKCE + `/auth/callback` | No frontend auth changes broken | ☐ |
| 32 | Legacy `POST /api/users/login` | Still works (deprecated alias) | ☐ |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
