import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
import { protect, authorize } from '../middlewares/authMiddleware.js';

// @desc    Get all shops (Admin only)
// @route   GET /api/shops/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status } = req.query;
        const skip = (page - 1) * limit;

        const where = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { owner: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (status && status !== 'ALL') {
             where.status = status;
        }

        const [shops, total] = await prisma.$transaction([
            prisma.shop.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    owner: {
                        select: { name: true, email: true, whatsapp: true }
                    },
                    _count: {
                        select: { products: true, orders: true }
                    }
                }
            }),
            prisma.shop.count({ where })
        ]);

        res.json({
            shops,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            totalShops: total
        });
    } catch (error) {
        console.error('Error fetching admin shops:', error);
        res.status(500).json({ message: 'Server error fetching shops' });
    }
});

// @desc    Update shop status (Admin only)
// @route   PUT /api/shops/admin/:id/status
// @access  Private/Admin
router.put('/admin/:id/status', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].includes(status)) {
             return res.status(400).json({ message: 'Invalid status' });
        }

        const shop = await prisma.shop.update({
            where: { id },
            data: { status },
            include: {
                owner: {
                    select: { email: true, name: true }
                }
            }
        });

        // TODO: Send email notification to shop owner about status change

        res.json(shop);
    } catch (error) {
        console.error('Error updating shop status:', error);
        res.status(500).json({ message: 'Server error updating shop status' });
    }
});

// @desc    Create a new shop
// @route   POST /api/shops
// @access  Private
router.post('/', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        let { name, description, slug, address, domain, phone, plan } = req.body;
        const userId = req.user.id;

        // Check if user already has a shop
        const existingShop = await prisma.shop.findFirst({
            where: { owner: { id: userId } }
        });

        if (existingShop) {
            return res.status(400).json({ message: 'User already has a shop' });
        }

        // Auto-generate slug if not provided
        if (!slug && name) {
            slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            // Append random string to ensure uniqueness
            slug += '-' + Math.random().toString(36).substring(2, 7);
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(slug)) {
            return res.status(400).json({ message: 'Shop URL can only contain lowercase letters, numbers, and hyphens.' });
        }

        // Check if slug is unique (double check)
        const slugExists = await prisma.shop.findUnique({
            where: { slug }
        });

        if (slugExists) {
            return res.status(400).json({ message: 'Shop URL already taken, please try a different name' });
        }

        // Append plan and phone to description if provided (Temporary solution until Subscription model)
        let finalDescription = description || '';
        if (phone) finalDescription += ` | Contact: ${phone}`;
        if (plan) finalDescription += ` | Plan: ${plan}`;

        // Create Shop
        const newShop = await prisma.shop.create({
            data: {
                name,
                description: finalDescription,
                slug,
                address,
                owner: {
                    connect: { id: userId }
                },
                status: 'PENDING' // Explicitly set to PENDING
            }
        });

        // Update User Role to SELLER so they can access dashboard
        await prisma.user.update({
            where: { id: userId },
            data: { 
                role: 'SELLER', 
                shopId: newShop.id
            }
        });

        res.status(201).json(newShop);
    } catch (error) {
        console.error('Error creating shop:', error);
        res.status(500).json({ message: 'Server error creating shop' });
    }
});

// @desc    Get shop statistics (Private)
// @route   GET /api/shops/stats
// @access  Private
router.get('/stats', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const userId = req.user.id;

        const myShop = await prisma.shop.findFirst({
            where: { owner: { id: userId } },
            include: {
                _count: {
                    select: { orders: true, products: true }
                },
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            }
        });

        if (!myShop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Calculate Revenue (Total from successful orders)
        // Since we don't have aggregation on filtered relation easily in one go with `findFirst`,
        // let's do a separate aggregate for revenue.
        const revenue = await prisma.order.aggregate({
            where: {
                shopId: myShop.id,
                paymentStatus: { in: ['paid', 'completed'] }
            },
            _sum: {
                netAmount: true
            }
        });

        const stats = {
            shopId: myShop.id,  // Added for socket room joining
            status: myShop.status, // Added for frontend access control
            totalRevenue: revenue._sum.netAmount || 0,
            totalOrders: myShop._count.orders,
            totalProducts: myShop._count.products,
            recentOrders: myShop.orders
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching shop stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

// @desc    Get public shop list (for Marketplace)
// @route   GET /api/shops/public
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const shops = await prisma.shop.findMany({
            take: 6, // Limit for homepage
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                logo: true
                // Add lat/lng later if needed
            }
        });
        res.json(shops);
    } catch (error) {
        console.error('Error fetching public shops:', error);
        res.status(500).json({ message: 'Server error fetching shops' });
    }
});

// @desc    Get current user's shop
// @route   GET /api/shops/me
// @access  Private
router.get('/me', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const shop = await prisma.shop.findFirst({
            where: { owner: { id: req.user.id } }
        });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.json(shop);
    } catch (error) {
        console.error('Error fetching shop:', error);
        res.status(500).json({ message: 'Server error fetching shop' });
    }
});

// @desc    Geocode address using Nominatim (Proxy to avoid CORS/UA issues)
// @route   GET /api/shops/geocode
// @access  Private
router.get('/geocode', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query address is required' });
        }

        const params = new URLSearchParams({
            q: q,
            format: 'json',
            limit: '1',
            addressdetails: '1'
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            headers: {
                'User-Agent': 'AxonDapurKita/1.0 (contact@axondapurkita.com)'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Geocoding proxy error:', error);
        res.status(500).json({ message: 'Server error during geocoding' });
    }
});

// @desc    Get shop by slug (Public)
// @route   GET /api/shops/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Skip if slug is 'me' (though handled by route order, safety check)
        if (slug === 'me') return res.status(404).json({ message: 'Shop not found' });

        const shop = await prisma.shop.findUnique({
            where: { slug },
            include: {
                products: {
                    include: {
                        images: true,
                        unit: true
                    },
                    orderBy: { isActive: 'asc' }
                }
            }
        });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        res.json(shop);
    } catch (error) {
        console.error('Error fetching shop by slug:', error);
        res.status(500).json({ message: 'Server error fetching shop' });
    }
});

// @desc    Get payment methods for multiple shops
// @route   POST /api/shops/payment-methods
// @access  Private (or Public if guest checkout allowed)
router.post('/payment-methods', async (req, res) => {
    try {
        const { slugs } = req.body; // Array of shop slugs

        if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
            return res.status(400).json({ message: 'Shop slugs are required' });
        }

        const shops = await prisma.shop.findMany({
            where: {
                slug: { in: slugs }
            },
            select: {
                slug: true,
                paymentMethods: true
            }
        });

        res.json(shops);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ message: 'Server error fetching payment methods' });
    }
});


import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Configure Multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    }
});

// @desc    Update current user's shop
// @route   PUT /api/shops
// @access  Private
router.put('/', upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'qrisImage', maxCount: 1 }
]), async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const { name, description, slug, address, isOpen } = req.body;
        const userId = req.user.id;

        // Find the shop owned by the user
        const shop = await prisma.shop.findFirst({
            where: { owner: { id: userId } }
        });

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // If slug is being changed, check if new slug is unique
        let newSlug = shop.slug;
        if (slug && slug !== shop.slug) {
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            if (!slugRegex.test(slug)) {
                return res.status(400).json({ message: 'Shop URL can only contain lowercase letters, numbers, and hyphens.' });
            }

            const slugExists = await prisma.shop.findUnique({
                where: { slug }
            });

            if (slugExists) {
                return res.status(400).json({ message: 'Shop URL already taken' });
            }
            newSlug = slug;
        }

        // Handle Logo Upload
        let logoPath = shop.logo;
        if (req.files && req.files['logo']) {
            const logoFile = req.files['logo'][0];
            const uploadDir = path.join('public', 'merchant', newSlug);
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `logo.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(logoFile.buffer)
                .resize(500, 500, { fit: 'cover' })
                .toFormat('webp')
                .toFile(filePath);
            
            logoPath = `/merchant/${newSlug}/${fileName}?t=${Date.now()}`;
        }

        // Handle QRIS Image Upload
        let qrisImagePath = shop.qrisImage;
        if (req.files && req.files['qrisImage']) {
            const qrisFile = req.files['qrisImage'][0];
            const uploadDir = path.join('public', 'merchant', newSlug);
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const fileName = `qris.webp`;
            const filePath = path.join(uploadDir, fileName);

            await sharp(qrisFile.buffer)
                .resize(800, 800, { fit: 'inside' }) // Keep aspect ratio for QR
                .toFormat('webp')
                .toFile(filePath);
            
            qrisImagePath = `/merchant/${newSlug}/${fileName}?t=${Date.now()}`;
        } else if (newSlug !== shop.slug && shop.qrisImage) {
             qrisImagePath = shop.qrisImage.replace(shop.slug, newSlug);
        } else if (newSlug !== shop.slug && shop.logo) {
            // Move existing logo if slug changed
            const oldDir = path.join('public', 'merchant', shop.slug);
            const newDir = path.join('public', 'merchant', newSlug);
            
            if (fs.existsSync(oldDir)) {
                if (!fs.existsSync(newDir)) {
                    fs.mkdirSync(newDir, { recursive: true });
                }
                // Move contents
                try {
                     fs.cpSync(oldDir, newDir, { recursive: true });
                     fs.rmSync(oldDir, { recursive: true, force: true });
                     // Update logo path in DB
                     logoPath = shop.logo.replace(shop.slug, newSlug);
                } catch (err) {
                    console.error('Error moving directory:', err);
                    // Continue even if move fails, maybe log error properly
                }
            }
        }

        // Parse isOpen boolean
        const isOpenBool = isOpen === 'true' || isOpen === true;

        // Update Shop
        const updatedShop = await prisma.shop.update({
            where: { id: shop.id },
            data: {
                name: name || shop.name,
                description: description !== undefined ? description : shop.description,
                slug: newSlug,
                address: address || shop.address,
                logo: logoPath,
                qrisImage: qrisImagePath,
                bankName: req.body.bankName !== undefined ? req.body.bankName : shop.bankName,
                bankAccountName: req.body.bankAccountName !== undefined ? req.body.bankAccountName : shop.bankAccountName,
                bankAccountNumber: req.body.bankAccountNumber !== undefined ? req.body.bankAccountNumber : shop.bankAccountNumber,
                isOpen: isOpen !== undefined ? isOpenBool : shop.isOpen,
                latitude: req.body.latitude ? parseFloat(req.body.latitude) : shop.latitude,
                longitude: req.body.longitude ? parseFloat(req.body.longitude) : shop.longitude,
                maxDeliveryDistance: req.body.maxDeliveryDistance ? parseFloat(req.body.maxDeliveryDistance) : shop.maxDeliveryDistance,
                paymentMethods: req.body.paymentMethods ? JSON.parse(req.body.paymentMethods) : shop.paymentMethods
            }
        });

        res.json(updatedShop);
    } catch (error) {
        console.error('Error updating shop:', error);
        res.status(500).json({ message: 'Server error updating shop' });
    }
});

export default router;
