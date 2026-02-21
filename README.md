# Cafe Management System

A full-stack web app for cafe table ordering. Customers scan QR codes on tables to view the menu and place orders. Managers can confirm/complete orders, manage the menu, banners, and offers.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.io
- **Frontend**: React, Vite, Tailwind CSS, React Router

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (running with database `Cafe`)

### Backend

```bash
cd backend
npm install
# Edit .env with your DATABASE_URL
npm run seed    # Creates manager (manager@cafe.com / manager123) and sample data
npm run dev     # Starts server on http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Starts on http://localhost:5173
```

The frontend proxies `/api` and `/socket.io` to the backend in development.

## Testing

```powershell
# Start backend first, then run tests
cd backend; npm run dev   # In one terminal
cd ..; .\run-tests.ps1    # In another (uses port 3001 by default)
# If backend uses port 3002: $env:API_PORT=3002; .\run-tests.ps1
```

See [TEST_RESULTS.md](TEST_RESULTS.md) for test details.

## Deploy for Free

See **[DEPLOY.md](DEPLOY.md)** for step-by-step instructions to host on Render + Vercel (or Render only).

## Usage

- **Customer**: Open `http://localhost:5173/order?table=1` (or scan QR) to view menu and place orders
- **Manager**: Open `http://localhost:5173/manager/login` - Login: `manager@cafe.com` / `manager123`
  - Orders: Confirm and complete orders
  - Menu: Add/edit/delete dishes
  - Banners & Offers: Manage promotions
  - QR Codes: Print QR codes for tables
