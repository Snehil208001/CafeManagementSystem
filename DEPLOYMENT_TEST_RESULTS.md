# Deployment Test Results

**Test Date:** February 21, 2026  
**Backend:** https://cafe-backend-hzy6.onrender.com  
**Frontend:** https://cafe-frontend-m4d9.onrender.com

---

## Backend API Tests

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /api/menu | 200 | Returns `{"dishes":[],"offers":[]}` - **Database not seeded** |
| GET /api/banners | 200 | OK |
| POST /api/auth/login | 401 | Manager not found - **Run `npm run seed` in backend Shell** |

---

## Frontend Tests

| Page | Status | Notes |
|------|--------|-------|
| / (root) | 200 | App loads, shows "Cafe - Order & Manage" |
| /order | 404 | SPA routing - needs rewrite rule (fixed in render.yaml) |
| /manager/login | 404 | SPA routing - needs rewrite rule (fixed in render.yaml) |

---

## Required Actions

1. **Seed the database**: Render Dashboard → cafe-backend → Shell → `npm run seed`
2. **Add SPA rewrite**: Added `routes` to render.yaml - redeploy frontend to fix /order and /manager/login 404s
3. **Set VITE_API_URL**: Frontend env var must be `https://cafe-backend-hzy6.onrender.com` for API calls to work
4. **Set FRONTEND_URL**: Backend env var must be `https://cafe-frontend-m4d9.onrender.com` for CORS

---

## After Fixes

- Customer: https://cafe-frontend-m4d9.onrender.com/order?table=1
- Manager: https://cafe-frontend-m4d9.onrender.com/manager/login
