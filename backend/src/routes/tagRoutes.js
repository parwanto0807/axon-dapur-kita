import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all tags (grouped by type)
// @route   GET /api/tags
// @access  Public
router.get('/', async (req, res) => {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: [{ type: 'asc' }, { name: 'asc' }]
        });
        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a tag (Admin)
// @route   POST /api/tags
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { name, slug, type } = req.body;
        const tagSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const tag = await prisma.tag.create({
            data: { name, slug: tagSlug, type: type || 'CHARACTERISTIC' }
        });
        res.status(201).json(tag);
    } catch (error) {
        console.error('Error creating tag:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
