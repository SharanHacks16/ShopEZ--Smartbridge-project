import express from 'express';
import { userDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, userDashboard);
export default router;
