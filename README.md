ShopEZ
ShopEZ is a full-stack stock trading simulation platform built with the MERN stack. It lets users explore a mock stock market, manage a virtual portfolio, view transaction history, and track performance, while admins can manage users, stocks, and trading activity.

Features
User authentication and role-based access
Landing page, login, registration, and password recovery flow
Market browsing and stock detail views
Virtual buying and selling of stocks
Portfolio dashboard with wallet balance and holdings
Transaction history and user activity tracking
Admin dashboard for monitoring stats and managing users, stocks, and transactions
Responsive UI with Bootstrap and modern React pages
Tech Stack
Frontend
React
React Router DOM
Vite
Bootstrap 5
Chart.js and react-chartjs-2
Axios
React Toastify
Backend
Node.js
Express.js
MongoDB with Mongoose
JWT authentication
bcryptjs for password hashing
Helmet, CORS, rate limiting, sanitization, and validation middleware
Project Structure
ShopEZ/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
├── package.json
└── README.md
Prerequisites
Before running the project, make sure you have:

Node.js 18+ installed
npm installed
MongoDB running locally or a MongoDB Atlas connection string
Installation
Clone the repository
Install root dependencies
Install client and server dependencies
npm install
npm install --prefix client
npm install --prefix server
Environment Variables
Create a file named .env inside the server folder and add the following values:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
STOCK_API_KEY=optional
The app is already configured to use the existing server environment file in this workspace, but you can replace it with your own values.

Running the Application
Start the backend
npm run dev --prefix server
Start the frontend
npm run dev --prefix client
The app will be available at:

Frontend: http://localhost:5173
Backend: http://localhost:5000
Seed Demo Data
To populate the database with sample users, stocks, portfolios, and transactions:

npm run seed --prefix server
This creates demo accounts such as:

Admin: admin@shopez.com / Admin@123
User: user@shopez.com / User@123
Main API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
PATCH /api/auth/change-password
Stocks
GET /api/stocks
GET /api/stocks/:id
POST /api/stocks
PUT /api/stocks/:id
DELETE /api/stocks/:id
Portfolio and Transactions
GET /api/portfolio
POST /api/portfolio/buy
POST /api/portfolio/sell
GET /api/transactions
Dashboard and Admin
GET /api/dashboard
GET /api/admin/stats
GET /api/admin/users
PATCH /api/admin/users/:id/status
Development Notes
The frontend uses lazy-loaded pages for better performance.
The backend uses modular route, controller, and middleware structure.
The app includes protected routes for authenticated users and admin-only routes.
Demo data is seeded through the server seed script.
Deployment
You can deploy the app in two parts:

Frontend: Vite app can be hosted on Vercel or Netlify
Backend: Express server can be hosted on Render, Railway, or similar services
Make sure to configure the production environment variables and update the client API URL to point to the deployed backend
