import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all categories (Sorted by Product Count DESC)
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        // Sort by product count descending
        const sortedCategories = categories.sort((a, b) => b._count.products - a._count.products);

        res.json(sortedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// @desc    Create a category (Admin only - explicit or implied)
// @route   POST /api/categories
// @access  Public (for seeding/dev) or Private
router.post('/', async (req, res) => {
    try {
        const { name, slug } = req.body;
        
        // Auto-generate slug if not provided
        const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const category = await prisma.category.create({
            data: {
                name,
                slug: categorySlug
            }
        });
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error creating category' });
    }
});

export default router;
