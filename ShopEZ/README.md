# ShopEZ

ShopEZ is a full-stack MERN stock trading simulation platform. Users can browse markets, buy and sell stocks with virtual money, review portfolios and transactions, while admins manage stocks, users, and trades.

## Tech Stack

React, React Router DOM, Bootstrap 5, Chart.js, Axios, Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Helmet, Morgan, Express Validator.

## Quick Start

1. Install MongoDB locally or create a MongoDB Atlas database.
2. Copy server/.env.example to server/.env and update values.
3. Install dependencies:

\`\`\`bash
npm install --prefix server
npm install --prefix client
\`\`\`

4. Seed demo data:

\`\`\`bash
npm run seed --prefix server
\`\`\`

5. Run the apps:

\`\`\`bash
npm run dev --prefix server
npm run dev --prefix client
\`\`\`

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Demo Accounts

Admin: admin@shopez.com / Admin@123  
User: user@shopez.com / User@123

## Environment Variables

See server/.env.example.

## API Overview

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- PUT /api/auth/profile
- PATCH /api/auth/change-password
- GET /api/stocks
- GET /api/stocks/:id
- POST /api/stocks
- PUT /api/stocks/:id
- DELETE /api/stocks/:id
- GET /api/portfolio
- POST /api/portfolio/buy
- POST /api/portfolio/sell
- GET /api/transactions
- GET /api/dashboard
- GET /api/admin/stats
- GET /api/admin/users
- PATCH /api/admin/users/:id/status

## Deployment

Deploy the client to Vercel or Netlify with VITE_API_URL pointing to the API URL. Deploy the server to Render or Railway with MongoDB Atlas and the environment variables from server/.env.example.

## Screenshots

Add screenshots for landing, dashboard, stock details, portfolio, transaction history, and admin dashboard after deployment.
