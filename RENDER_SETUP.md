# One-Time Setup for Deployed App

After deploying to Render, run this **once** to seed the database:

## Seed the Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Open **cafe-backend**
3. Click **Shell** (in the left sidebar)
4. Run: `npm run seed`
5. You should see: "Created manager", "Created 5 tables", "Created sample dishes"

## Manager Login

- **URL**: https://cafe-frontend-m4d9.onrender.com/manager/login
- **Email**: manager@cafe.com
- **Password**: manager123

## Access Manager from Order Page

On the customer order page, click **Manager** in the top-right corner to go to the manager login.
