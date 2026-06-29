import Stock from '../models/Stock.js';
const symbols = ['AAPL','GOOGL','AMZN','MSFT','TSLA','NVDA','META','NFLX','IBM','ORCL','TCS','INFY','RELIANCE','HDFCBANK','SBIN','ADBE','CRM','INTC','AMD','SHOP'];
export const generateHistory = (base) => Array.from({ length: 30 }, (_, index) => ({ date: new Date(Date.now() - (29 - index) * 86400000), price: Number((base * (0.9 + Math.random() * 0.22)).toFixed(2)) }));
export const mockStocks = symbols.map((symbol, index) => {
  const price = Number((80 + Math.random() * 900 + index * 7).toFixed(2));
  return { symbol, companyName: symbol + ' Corporation', currentPrice: price, previousClose: Number((price * (0.97 + Math.random() * 0.06)).toFixed(2)), marketCap: Math.round((price * (100000000 + Math.random() * 900000000))), sector: ['Technology','Finance','Consumer','Energy','Healthcare'][index % 5], description: symbol + ' is a listed company tracked in the ShopEZ virtual market.', logo: 'https://dummyimage.com/96x96/2563eb/ffffff&text=' + symbol.slice(0, 2), dailyHigh: Number((price * 1.04).toFixed(2)), dailyLow: Number((price * 0.96).toFixed(2)), volume: Math.round(1000000 + Math.random() * 80000000), history: generateHistory(price) };
});
export const refreshMockPrices = async () => {
  const stocks = await Stock.find({ isActive: true });
  await Promise.all(stocks.map((stock) => {
    const movement = 1 + ((Math.random() - 0.48) / 40);
    stock.previousClose = stock.currentPrice;
    stock.currentPrice = Number(Math.max(1, stock.currentPrice * movement).toFixed(2));
    stock.dailyHigh = Math.max(stock.dailyHigh, stock.currentPrice);
    stock.dailyLow = Math.min(stock.dailyLow, stock.currentPrice);
    stock.volume += Math.round(Math.random() * 10000);
    stock.history.push({ date: new Date(), price: stock.currentPrice });
    stock.history = stock.history.slice(-60);
    return stock.save();
  }));
};
