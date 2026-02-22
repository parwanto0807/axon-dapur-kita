import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// @desc    Get all units (with product count)
// @route   GET /api/units
// @access  Public
router.get('/', async (req, res) => {
    try {
        const units = await prisma.unit.findMany({
            orderBy: [{ group: 'asc' }, { name: 'asc' }],
            include: {
                _count: { select: { products: true } }
            }
        });
        res.json(units);
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ message: 'Server error fetching units' });
    }
});

// @desc    Get single unit by id
// @route   GET /api/units/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const unit = await prisma.unit.findUnique({
            where: { id: req.params.id },
            include: { _count: { select: { products: true } } }
        });
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        res.json(unit);
    } catch (error) {
        console.error('Error fetching unit:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create a unit
// @route   POST /api/units
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const { name, symbol, group, subGroup, isFractionAllowed, decimalPlaces, conversionBase, conversionRate } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Nama satuan wajib diisi' });
        }

        const existing = await prisma.unit.findUnique({ where: { name: name.trim() } });
        if (existing) {
            return res.status(400).json({ message: `Satuan "${name.trim()}" sudah ada` });
        }

        const unit = await prisma.unit.create({
            data: {
                name: name.trim(),
                symbol: symbol?.trim() || null,
                group: group?.trim() || null,
                subGroup: subGroup?.trim() || null,
                isFractionAllowed: Boolean(isFractionAllowed),
                decimalPlaces: parseInt(decimalPlaces) || 0,
                conversionBase: conversionBase?.trim() || null,
                conversionRate: conversionRate ? parseFloat(conversionRate) : null,
            }
        });
        res.status(201).json(unit);
    } catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({ message: 'Server error creating unit' });
    }
});

// @desc    Update a unit
// @route   PUT /api/units/:id
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { name, symbol, group, subGroup, isFractionAllowed, decimalPlaces, conversionBase, conversionRate } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Nama satuan wajib diisi' });
        }

        // Check name uniqueness (exclude current)
        const existing = await prisma.unit.findUnique({ where: { name: name.trim() } });
        if (existing && existing.id !== req.params.id) {
            return res.status(400).json({ message: `Satuan "${name.trim()}" sudah ada` });
        }

        const unit = await prisma.unit.update({
            where: { id: req.params.id },
            data: {
                name: name.trim(),
                symbol: symbol?.trim() || null,
                group: group?.trim() || null,
                subGroup: subGroup?.trim() || null,
                isFractionAllowed: Boolean(isFractionAllowed),
                decimalPlaces: parseInt(decimalPlaces) || 0,
                conversionBase: conversionBase?.trim() || null,
                conversionRate: conversionRate ? parseFloat(conversionRate) : null,
            }
        });
        res.json(unit);
    } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({ message: 'Server error updating unit' });
    }
});

// @desc    Delete a unit
// @route   DELETE /api/units/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const unit = await prisma.unit.findUnique({
            where: { id: req.params.id },
            include: { _count: { select: { products: true } } }
        });
        if (!unit) return res.status(404).json({ message: 'Unit not found' });

        if (unit._count.products > 0) {
            return res.status(400).json({
                message: `Satuan tidak dapat dihapus karena digunakan oleh ${unit._count.products} produk`
            });
        }

        await prisma.unit.delete({ where: { id: req.params.id } });
        res.json({ message: 'Unit deleted successfully' });
    } catch (error) {
        console.error('Error deleting unit:', error);
        res.status(500).json({ message: 'Server error deleting unit' });
    }
});

export default router;
