# Deploy to Render - Step by Step

Your repo is live at: **https://github.com/Snehil208001/CafeManagementSystem**

## 1. Create Render Account
Go to [render.com](https://render.com) and sign up (free with GitHub).

## 2. Deploy with Blueprint
1. Click **New** → **Blueprint**
2. Connect **GitHub** and authorize Render
3. Select repo: **Snehil208001/CafeManagementSystem**
4. Render will detect `render.yaml` and show:
   - **cafe-backend** (Web Service)
   - **cafe-frontend** (Static Site)
   - **cafe-db** (PostgreSQL)
5. Click **Apply**

## 3. Wait for First Deploy
- Backend and database deploy first (~5 min)
- Frontend deploys after (~3 min)
- Note the URLs:
  - Backend: `https://cafe-backend-XXXX.onrender.com`
  - Frontend: `https://cafe-frontend-XXXX.onrender.com`

## 4. Set Environment Variables (Required)

### Backend (cafe-backend)
1. Dashboard → **cafe-backend** → **Environment**
2. Add:
   - **FRONTEND_URL** = `https://cafe-frontend-XXXX.onrender.com` (use your actual frontend URL)
3. Click **Save Changes** → Redeploy

### Frontend (cafe-frontend)
1. Dashboard → **cafe-frontend** → **Environment**
2. Add:
   - **VITE_API_URL** = `https://cafe-backend-XXXX.onrender.com` (use your actual backend URL)
3. Click **Save Changes** → Redeploy

## 5. Seed the Database
1. Dashboard → **cafe-backend** → **Shell**
2. Run: `npm run seed`
3. Creates manager (manager@cafe.com / manager123) and sample dishes

## 6. Done
- **Customer**: https://cafe-frontend-XXXX.onrender.com/order?table=1
- **Manager**: https://cafe-frontend-XXXX.onrender.com/manager/login

Login: **manager@cafe.com** / **manager123**

---

## Troubleshooting

**CORS error**: Ensure FRONTEND_URL matches your frontend URL exactly (https, no trailing slash).

**Cold start**: Free tier sleeps after 15 min inactivity. First request may take ~30 seconds.

**Database**: Render PostgreSQL is free for 90 days. For permanent free DB, use [Neon](https://neon.tech) and set DATABASE_URL in backend env.
