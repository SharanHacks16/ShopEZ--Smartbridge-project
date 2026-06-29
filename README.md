````markdown
# 📈 ShopEZ

<div align="center">

### A Full-Stack MERN Stock Trading Simulation Platform

Practice stock trading in a realistic virtual environment with portfolio management, transaction tracking, and an admin dashboard.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-darkgreen?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📖 Overview

**ShopEZ** is a full-stack stock trading simulation platform built using the **MERN Stack**. It allows users to experience stock trading without financial risk by providing a virtual trading environment.

Users can browse stocks, buy and sell shares using virtual money, monitor their portfolio, and review transaction history. Administrators have complete control over users, stocks, and platform statistics through a dedicated admin dashboard.

---

## ✨ Features

### 👤 User Features

- 🔐 Secure JWT Authentication
- 👥 Role-Based Authorization (User/Admin)
- 📝 User Registration & Login
- 🔑 Password Recovery & Change Password
- 📈 Browse Available Stocks
- 📊 View Stock Details
- 💰 Buy & Sell Stocks with Virtual Wallet
- 💼 Portfolio Management
- 📜 Transaction History
- 📉 Performance Tracking
- 📱 Fully Responsive Interface

### 🛠️ Admin Features

- 📊 Dashboard Statistics
- 👤 User Management
- 📈 Stock Management
- 💳 Transaction Monitoring
- 🔒 User Status Control

---

# 🛠 Tech Stack

## Frontend

- React
- React Router DOM
- Vite
- Bootstrap 5
- Axios
- Chart.js
- React ChartJS 2
- React Toastify

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Helmet
- CORS
- Express Rate Limit
- Express Validator
- Mongo Sanitize

---

# 📂 Project Structure

```text
ShopEZ/
│
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
│
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
│
├── package.json
└── README.md
```

---

# ⚙️ Prerequisites

Before getting started, ensure you have:

- Node.js (v18 or higher)
- npm
- MongoDB (Local or MongoDB Atlas)

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shopez.git
cd shopez
```

---

## 2. Install Dependencies

Install project dependencies.

```bash
npm install
npm install --prefix client
npm install --prefix server
```

---

# 🔐 Environment Variables

Create a `.env` file inside the **server/** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

STOCK_API_KEY=optional
```

> **Note:** You may replace these values with your own production credentials.

---

# ▶️ Running the Application

### Start Backend

```bash
npm run dev --prefix server
```

### Start Frontend

```bash
npm run dev --prefix client
```

---

## Application URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

---

# 🌱 Seed Demo Data

Populate the database with demo users, stocks, portfolios, and transactions.

```bash
npm run seed --prefix server
```

### Demo Accounts

#### 👨‍💼 Admin

```
Email:
admin@shopez.com

Password:
Admin@123
```

#### 👤 User

```
Email:
user@shopez.com

Password:
User@123
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| GET | `/api/auth/profile` |
| PUT | `/api/auth/profile` |
| PATCH | `/api/auth/change-password` |

---

## Stocks

| Method | Endpoint |
|---------|----------|
| GET | `/api/stocks` |
| GET | `/api/stocks/:id` |
| POST | `/api/stocks` |
| PUT | `/api/stocks/:id` |
| DELETE | `/api/stocks/:id` |

---

## Portfolio

| Method | Endpoint |
|---------|----------|
| GET | `/api/portfolio` |
| POST | `/api/portfolio/buy` |
| POST | `/api/portfolio/sell` |

---

## Transactions

| Method | Endpoint |
|---------|----------|
| GET | `/api/transactions` |

---

## Dashboard

| Method | Endpoint |
|---------|----------|
| GET | `/api/dashboard` |

---

## Admin

| Method | Endpoint |
|---------|----------|
| GET | `/api/admin/stats` |
| GET | `/api/admin/users` |
| PATCH | `/api/admin/users/:id/status` |

---

# 📸 Screenshots

Add screenshots of your application here.

```
Landing Page

Login

Dashboard

Portfolio

Stock Details

Admin Dashboard
```

---

# 💡 Development Notes

- Lazy-loaded React pages for better performance.
- Modular backend architecture.
- Protected user routes.
- Admin-only authorization.
- JWT authentication.
- Database seeding support.
- Responsive Bootstrap UI.

---

# 🚀 Deployment

## Frontend

Deploy using:

- Vercel
- Netlify

## Backend

Deploy using:

- Render
- Railway
- DigitalOcean
- AWS

After deployment, update:

- Environment Variables
- API Base URL
- CORS Configuration

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

### ⭐ If you like this project, don't forget to star the repository!

Made with ❤️ using the MERN Stack

</div>
````

