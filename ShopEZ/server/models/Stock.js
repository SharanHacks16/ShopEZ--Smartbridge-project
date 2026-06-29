import mongoose from 'mongoose';
const pricePointSchema = new mongoose.Schema({ date: { type: Date, default: Date.now }, price: { type: Number, required: true } }, { _id: false });
const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  currentPrice: { type: Number, required: true, min: 0 },
  previousClose: { type: Number, required: true, min: 0 },
  marketCap: { type: Number, required: true, min: 0 },
  sector: { type: String, required: true },
  description: { type: String, required: true },
  logo: { type: String, default: '' },
  dailyHigh: { type: Number, required: true, min: 0 },
  dailyLow: { type: Number, required: true, min: 0 },
  volume: { type: Number, required: true, min: 0 },
  history: [pricePointSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
stockSchema.virtual('changePercent').get(function changePercent() { return this.previousClose ? ((this.currentPrice - this.previousClose) / this.previousClose) * 100 : 0; });
stockSchema.set('toJSON', { virtuals: true });
stockSchema.index({ symbol: 'text', companyName: 'text', sector: 1 });
export default mongoose.model('Stock', stockSchema);
