import mongoose from 'mongoose';
const holdingSchema = new mongoose.Schema({ stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true }, quantity: { type: Number, required: true, min: 0 }, averagePrice: { type: Number, required: true, min: 0 } }, { _id: false });
const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  holdings: [holdingSchema],
  walletBalance: { type: Number, default: 100000, min: 0 },
  totalInvestment: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  profitLoss: { type: Number, default: 0 }
}, { timestamps: true });
portfolioSchema.index({ user: 1 });
export default mongoose.model('Portfolio', portfolioSchema);
