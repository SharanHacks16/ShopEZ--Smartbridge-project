import Portfolio from '../models/Portfolio.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';
export const getOrCreatePortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ user: userId }).populate('holdings.stock');
  if (!portfolio) portfolio = await Portfolio.create({ user: userId });
  return portfolio.populate('holdings.stock');
};
export const recalculatePortfolio = async (portfolio) => {
  await portfolio.populate('holdings.stock');
  portfolio.totalInvestment = portfolio.holdings.reduce((sum, item) => sum + item.quantity * item.averagePrice, 0);
  portfolio.currentValue = portfolio.holdings.reduce((sum, item) => sum + item.quantity * item.stock.currentPrice, 0);
  portfolio.profitLoss = portfolio.currentValue - portfolio.totalInvestment;
  await portfolio.save();
  return portfolio;
};
export const buyStock = async (userId, stockId, quantity) => {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) throw new Error('Quantity must be a positive whole number');
  const stock = await Stock.findById(stockId);
  if (!stock || !stock.isActive) throw new Error('Stock not found');
  const portfolio = await getOrCreatePortfolio(userId);
  const totalAmount = Number((stock.currentPrice * qty).toFixed(2));
  if (portfolio.walletBalance < totalAmount) throw new Error('Insufficient wallet balance');
  const existing = portfolio.holdings.find((h) => h.stock._id.toString() === stock._id.toString());
  if (existing) {
    const totalQty = existing.quantity + qty;
    existing.averagePrice = Number(((existing.averagePrice * existing.quantity + totalAmount) / totalQty).toFixed(2));
    existing.quantity = totalQty;
  } else {
    portfolio.holdings.push({ stock: stock._id, quantity: qty, averagePrice: stock.currentPrice });
  }
  portfolio.walletBalance = Number((portfolio.walletBalance - totalAmount).toFixed(2));
  await Transaction.create({ user: userId, stock: stockId, buyOrSell: 'buy', quantity: qty, price: stock.currentPrice, totalAmount });
  return recalculatePortfolio(portfolio);
};
export const sellStock = async (userId, stockId, quantity) => {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) throw new Error('Quantity must be a positive whole number');
  const stock = await Stock.findById(stockId);
  if (!stock || !stock.isActive) throw new Error('Stock not found');
  const portfolio = await getOrCreatePortfolio(userId);
  const existing = portfolio.holdings.find((h) => h.stock._id.toString() === stock._id.toString());
  if (!existing || existing.quantity < qty) throw new Error('Cannot sell more shares than owned');
  const totalAmount = Number((stock.currentPrice * qty).toFixed(2));
  existing.quantity -= qty;
  portfolio.holdings = portfolio.holdings.filter((h) => h.quantity > 0);
  portfolio.walletBalance = Number((portfolio.walletBalance + totalAmount).toFixed(2));
  await Transaction.create({ user: userId, stock: stockId, buyOrSell: 'sell', quantity: qty, price: stock.currentPrice, totalAmount });
  return recalculatePortfolio(portfolio);
};
