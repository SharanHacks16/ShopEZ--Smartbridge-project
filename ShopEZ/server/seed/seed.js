import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Stock from '../models/Stock.js';
import Portfolio from '../models/Portfolio.js';
import Transaction from '../models/Transaction.js';
import { mockStocks } from '../services/stockService.js';
import { buyStock, sellStock } from '../services/portfolioService.js';
const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Stock.deleteMany(), Portfolio.deleteMany(), Transaction.deleteMany()]);
  const admin = await User.create({ name: 'ShopEZ Admin', email: 'admin@shopez.com', password: 'Admin@123', role: 'admin' });
  const user = await User.create({ name: 'Demo User', email: 'user@shopez.com', password: 'User@123', role: 'user' });
  await Portfolio.create({ user: admin._id, walletBalance: 250000 });
  await Portfolio.create({ user: user._id, walletBalance: 100000 });
  const stocks = await Stock.insertMany(mockStocks);
  for (let i = 0; i < 35; i += 1) await buyStock(user._id, stocks[i % stocks.length]._id, (i % 6) + 1);
  for (let i = 0; i < 15; i += 1) { try { await sellStock(user._id, stocks[i % stocks.length]._id, 1); } catch (_error) {} }
  console.log('Seeded ShopEZ with admin@shopez.com/Admin@123 and user@shopez.com/User@123');
  process.exit(0);
};
seed().catch((error) => { console.error(error); process.exit(1); });
