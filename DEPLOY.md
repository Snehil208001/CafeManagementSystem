# Deploy Cafe Management System (Free)

Host both frontend and backend for free using **Render** (backend + database + frontend) or **Vercel + Render**.

**Quick start**: See **[RENDER_DEPLOY.md](RENDER_DEPLOY.md)** for step-by-step with your repo.

---

## Option A: All-in-One on Render (Recommended)

**Repo**: https://github.com/Snehil208001/CafeManagementSystem

### 1. Deploy on Render
1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create:
   - **cafe-backend** (Node.js API)
   - **cafe-frontend** (Static site)
   - **cafe-db** (PostgreSQL)

### 3. Set Environment Variables (after first deploy)
1. **Backend** → Environment → Add:
   - `FRONTEND_URL` = `https://cafe-frontend.onrender.com` (or your frontend URL)
2. **Frontend** → Environment → Add:
   - `VITE_API_URL` = `https://cafe-backend.onrender.com` (your backend URL)
3. Redeploy both services

### 4. Seed the Database
In Render Dashboard → cafe-backend → Shell:
```bash
npm run seed
```

### 5. Done
- **Customer**: https://cafe-frontend.onrender.com/order?table=1
- **Manager**: https://cafe-frontend.onrender.com/manager/login (manager@cafe.com / manager123)

---

## Option B: Vercel (Frontend) + Render (Backend) + Neon (Database)

Better for production: Vercel has faster frontend CDN; Neon has a more generous free PostgreSQL tier.

### 1. Create Neon Database (Free)
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a project → Copy the connection string
3. Format: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`

### 2. Deploy Backend on Render
1. [render.com](https://render.com) → New → Web Service
2. Connect repo, set **Root Directory**: `backend`
3. **Build**: `npm install && npx prisma generate && npm run build`
4. **Start**: `npx prisma migrate deploy && npm run start`
5. Environment variables:
   - `DATABASE_URL` = (Neon connection string)
   - `JWT_SECRET` = (generate a random string)
   - `FRONTEND_URL` = (set after Vercel deploy)
6. Deploy → Copy backend URL (e.g. `https://cafe-backend.onrender.com`)

### 3. Deploy Frontend on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Import your GitHub repo
3. **Root Directory**: `frontend`
4. **Framework Preset**: Vite
5. Environment variable:
   - `VITE_API_URL` = `https://cafe-backend.onrender.com`
6. Deploy → Copy frontend URL

### 4. Update CORS
In Render → cafe-backend → Environment:
- `FRONTEND_URL` = `https://your-app.vercel.app`

### 5. Seed Database
Render → cafe-backend → Shell: `npm run seed`

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| Render Web Service | Spins down after 15 min inactivity; cold start ~30s |
| Render PostgreSQL | 90 days free, then $7/mo |
| Neon PostgreSQL | 0.5 GB storage, unlimited projects |
| Vercel | 100 GB bandwidth, unlimited static sites |

---

## Troubleshooting

**CORS errors**: Ensure `FRONTEND_URL` in backend matches your frontend URL exactly (with https, no trailing slash).

**Database connection**: For Neon, use the pooled connection string (has `-pooler` in hostname) for serverless.

**Socket.io**: Real-time updates work when frontend and backend share the same origin (Render) or when CORS allows the frontend origin.
