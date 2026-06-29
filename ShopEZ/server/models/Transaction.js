import mongoose from 'mongoose';
const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
  buyOrSell: { type: String, enum: ['buy', 'sell'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });
transactionSchema.index({ user: 1, timestamp: -1 });
export default mongoose.model('Transaction', transactionSchema);
