import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    updateFCMToken,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.post('/fcm-token', updateFCMToken);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
