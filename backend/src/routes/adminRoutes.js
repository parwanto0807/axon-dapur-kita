import express from 'express';
import { getStatistics } from '../controllers/adminController.js';

const router = express.Router();

// Get admin dashboard statistics
router.get('/statistics', getStatistics);

export default router;
