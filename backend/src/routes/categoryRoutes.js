import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all categories (with children / sub-categories)
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { parentId: null }, // Only root/parent categories
            include: {
                children: {
                    include: {
                        _count: {
                            select: { products: true }
                        }
                    }
                },
                _count: {
                    select: { products: true }
                }
            }
        });

        // Sum products from parent + all its children
        const categoriesWithTotalCount = categories.map(cat => {
            const childrenProductCount = cat.children.reduce((sum, child) => sum + child._count.products, 0);
            return {
                ...cat,
                _count: {
                    products: cat._count.products + childrenProductCount
                }
            };
        });

        // Sort by total product count descending
        const sorted = categoriesWithTotalCount.sort((a, b) => b._count.products - a._count.products);
        res.json(sorted);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// @desc    Get all categories flat (for dropdowns)
// @route   GET /api/categories/all
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
            include: {
                parent: { select: { name: true, slug: true } },
                _count: { select: { products: true } }
            }
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching all categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const category = await prisma.category.findUnique({
            where: { slug: req.params.slug },
            include: {
                children: true,
                parent: { select: { name: true, slug: true } },
                _count: { select: { products: true } }
            }
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const { name, slug, parentId, icon } = req.body;
        const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const category = await prisma.category.create({
            data: { name, slug: categorySlug, parentId: parentId || null, icon: icon || null }
        });
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error creating category' });
    }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { name, slug, parentId, icon } = req.body;
        const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const category = await prisma.category.update({
            where: { id: req.params.id },
            data: {
                name,
                slug: categorySlug,
                parentId: parentId || null,
                icon: icon || null
            }
        });
        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error updating category' });
    }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        // Check for products
        const count = await prisma.product.count({ where: { categoryId: req.params.id } });
        if (count > 0) {
            return res.status(400).json({ message: `Kategori tidak dapat dihapus karena digunakan oleh ${count} produk` });
        }
        // Check for sub-categories
        const childCount = await prisma.category.count({ where: { parentId: req.params.id } });
        if (childCount > 0) {
            return res.status(400).json({ message: `Hapus sub-kategori terlebih dahulu sebelum menghapus kategori induk` });
        }

        await prisma.category.delete({ where: { id: req.params.id } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error deleting category' });
    }
});

export default router;
