import express from 'express';
import { authorize, protect } from '../middleware/authMiddleware.js';
import { deleteTransaction, getTransactions, updateTransactionStatus } from '../controllers/transactionController.js';
const router = express.Router();
router.get('/', protect, getTransactions);
router.patch('/:id/status', protect, authorize('admin'), updateTransactionStatus);
router.delete('/:id', protect, authorize('admin'), deleteTransaction);
export default router;
