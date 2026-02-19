import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all units
// @route   GET /api/units
// @access  Public
router.get('/', async (req, res) => {
    try {
        const units = await prisma.unit.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(units);
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ message: 'Server error fetching units' });
    }
});

export default router;
