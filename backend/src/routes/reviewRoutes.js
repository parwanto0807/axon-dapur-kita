import express from 'express';
import { createReview, getProductReviews, getShopStats, getShopReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/shop/:shopId', getShopReviews);
router.get('/shop/:shopId/stats', getShopStats);

export default router;
