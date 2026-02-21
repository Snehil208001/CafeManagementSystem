# Cafe Management System - Test Results

## Test Date
February 21, 2026

## Environment
- Backend: Node.js + Express on port 3002
- Frontend: Vite + React on port 5174
- Database: PostgreSQL (Cafe)

---

## 1. API Tests (Automated)

All API tests passed.

| Test | Endpoint | Result |
|------|----------|--------|
| GET menu | `GET /api/menu` | PASS - 9 dishes returned |
| GET banners | `GET /api/banners` | PASS |
| Manager login | `POST /api/auth/login` | PASS - token received |
| Create order | `POST /api/orders` | PASS - order created |
| Get table orders | `GET /api/orders/table/1` | PASS |
| Manager orders | `GET /api/orders/manager` | PASS (with JWT) |
| Update order status | `PATCH /api/orders/:id/status` | PASS |
| Manager menu | `GET /api/menu/all` | PASS (with JWT) |
| Create banner | `POST /api/banners` | PASS (with JWT) |
| Get tables | `GET /api/tables` | PASS (with JWT) |

**Result: 10/10 passed**

---

## 1. API Test Details (12 tests)

| # | Test | Endpoint | Status |
|---|------|----------|--------|
| 1 | Get menu | GET /api/menu | PASS |
| 2 | Get banners | GET /api/banners | PASS |
| 3 | Manager login | POST /api/auth/login | PASS |
| 4 | Create order | POST /api/orders | PASS |
| 5 | Get table orders | GET /api/orders/table/1 | PASS |
| 6 | Manager orders | GET /api/orders/manager | PASS |
| 7 | Update order status | PATCH /api/orders/:id/status | PASS |
| 8 | Manager menu | GET /api/menu/all | PASS |
| 9 | Create banner | POST /api/banners | PASS |
| 10 | Get tables | GET /api/tables | PASS |
| 11 | Create offer | POST /api/offers | PASS |
| 12 | Add dish | POST /api/menu | PASS |

## 2. Manual Test Checklist

### Customer Flow (http://localhost:5174/order?table=1)
- [ ] Page loads with menu (Beverages, Food, Desserts)
- [ ] Add items to cart
- [ ] Update quantity (+/-)
- [ ] Place order
- [ ] See order status update (Order received → Confirmed → Preparing → Ready)

### Manager Flow (http://localhost:5174/manager/login)
- [ ] Login: manager@cafe.com / manager123
- [ ] **Orders**: See active orders, Confirm → Start Preparing → Complete
- [ ] **Menu**: Add new dish, edit dish, delete dish
- [ ] **Banners & Offers**: Add banner with image URL, add offer
- [ ] **QR Codes**: View printable QR codes for tables 1-5

---

## 4. How to Run Tests

```powershell
# Start backend (port 3002)
cd backend; $env:PORT=3002; npm run dev

# Start frontend (in another terminal)
cd frontend; npm run dev

# Run API tests
powershell -ExecutionPolicy Bypass -File test-api.ps1
```

---

## 5. Known Configuration

- **Vite proxy** points to `http://localhost:3002` (update if backend runs on 3001)
- **Backend** uses `PORT` env var; default 3001, set 3002 if 3001 is in use
