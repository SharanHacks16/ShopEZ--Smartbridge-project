# ShopEZ — Virtual Stock Trading Platform

A production-quality stock trading simulation platform built with **React + Vite + Supabase**. Users can browse stocks, buy/sell with virtual money, track their portfolio, and administrators can manage users, stocks, and transactions.

## Features

### User Features
- Browse 20+ listed stocks with live price simulation (30-second updates)
- Buy and sell stocks using $100,000 virtual starting balance
- Real-time portfolio tracking with P/L calculation
- Interactive charts (line, pie, bar) powered by Chart.js
- Transaction history with CSV export and filters
- Profile management and password change

### Admin Features
- Admin dashboard with platform-wide analytics
- User management (activate/deactivate/delete)
- Stock CRUD (add/edit/delete stocks)
- Transaction management (approve/reject/delete)

### Technical Features
- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all database tables
- Responsive design (desktop, tablet, mobile)
- Lazy loading and code splitting
- Debounced search, pagination
- Toast notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router DOM v6 |
| Styling | Bootstrap 5, Custom CSS Variables |
| Charts | Chart.js + react-chartjs-2 |
| Auth | Supabase Auth (email/password) |
| Database | Supabase (PostgreSQL) |
| HTTP | @supabase/supabase-js |
| Notifications | React Toastify |

## Project Structure

```
src/
├── App.jsx                    # Routes + providers
├── main.jsx                   # Entry point
├── index.css                  # Global styles + CSS vars
├── lib/
│   └── supabase.js            # Supabase client
├── context/
│   └── AuthContext.jsx        # Auth state + login/register/logout
├── hooks/
│   ├── useTrade.js            # Buy/sell business logic
│   ├── useStocks.js           # Stock fetching + price simulation
│   └── useSeedOnce.js         # One-time demo user seeding
├── services/
│   └── api.js                 # stockService, portfolioService, transactionService, userService
├── utils/
│   ├── helpers.js             # formatCurrency, exportCSV, debounce, etc.
│   └── seed.js                # Demo user seeder
├── components/
│   ├── auth/ProtectedRoute.jsx
│   ├── layout/ (AppLayout, Sidebar, Topbar)
│   ├── ui/ (Loader, Badges, StockCard, Pagination, ConfirmDialog)
│   └── charts/Charts.jsx
└── pages/
    ├── LandingPage.jsx
    ├── DashboardPage.jsx
    ├── MarketPage.jsx
    ├── StockDetailPage.jsx
    ├── PortfolioPage.jsx
    ├── TransactionsPage.jsx
    ├── ProfilePage.jsx
    ├── NotFoundPage.jsx
    ├── auth/ (Login, Register, ForgotPassword)
    └── admin/ (Dashboard, Users, Stocks, Transactions)
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopez.com | Admin@123 |
| User | user@shopez.com | User@123 |

## Database Schema

### Tables
- **profiles** — user profiles extending `auth.users` (name, role, wallet_balance, is_active)
- **stocks** — listed stocks (symbol, price, history JSONB, sector, market cap, volume)
- **portfolios** — per-user portfolio (holdings JSONB, wallet balance, investment totals)
- **transactions** — trade history (buy/sell, quantity, price, status)

All tables have Row Level Security enabled with per-role policies.

## Business Logic

**Buying a stock:**
1. Validate sufficient wallet balance
2. Add/update holding in portfolio
3. Deduct from wallet balance
4. Create transaction record

**Selling a stock:**
1. Validate sufficient shares owned
2. Reduce holding quantity (remove if zero)
3. Add proceeds to wallet balance
4. Record realized P/L
5. Create transaction record

## API Reference (Supabase RLS-secured)

All data access is via the Supabase JS client, secured by RLS policies:

| Resource | Operations |
|----------|-----------|
| /profiles | SELECT (own), UPDATE (own), admin SELECT ALL |
| /stocks | SELECT (all authenticated), admin INSERT/UPDATE/DELETE |
| /portfolios | CRUD (own), admin SELECT |
| /transactions | SELECT/INSERT (own), admin SELECT/UPDATE/DELETE |

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are pre-configured in the project environment.

## Deployment

The project is deployment-ready for:
- **Vercel** — connect repo, set env vars
- **Netlify** — `npm run build` → deploy `dist/`
- **Railway** — static site deployment

Build command: `npm run build`  
Output directory: `dist/`
