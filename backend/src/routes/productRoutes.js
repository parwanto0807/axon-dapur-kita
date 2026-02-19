import express from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure Multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    }
});

// Helper to check ownership
const checkShopOwnership = async (userId) => {
    const shop = await prisma.shop.findFirst({
        where: { owner: { id: userId } }
    });
    return shop;
};

// @desc    Get public product list (Best Sellers/Latest)
// @route   GET /api/products/public
// @access  Public
// @desc    Get public product list (Best Sellers/Latest)
// @route   GET /api/products/public
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const { category } = req.query;

        const whereClause = {
            isActive: true,
            status: 'ACTIVE',
            stock: { gt: 0 }
        };

        if (category && category !== 'all') {
            const categoryRecord = await prisma.category.findUnique({
                where: { slug: category }
            });
            
            if (categoryRecord) {
                whereClause.categoryId = categoryRecord.id;
            }
        }

        const products = await prisma.product.findMany({
            where: whereClause,
            take: 12, // Increased limit for better variety
            orderBy: { createdAt: 'desc' },
            include: {
                shop: {
                    select: { name: true, slug: true, address: true }
                },
                images: true,
                category: true
            }
        });

        const productsWithImage = products.map(product => ({
            ...product,
            image: product.images.length > 0 
                ? (product.images.find(img => img.isPrimary)?.url || product.images[0].url) 
                : null
        }));

        res.json(productsWithImage);
    } catch (error) {
        console.error('Error fetching public products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// @desc    Get all products for current merchant
// @route   GET /api/products/my-products
// @access  Private
router.get('/my-products', async (req, res) => {
    // Check authentication
    if (!req.isAuthenticated || !req.isAuthenticated()) {
         return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const shop = await checkShopOwnership(req.user.id);
        
        // If shop not found, return empty array instead of 404 to avoid breaking UI on first load
        if (!shop) {
             console.log('Shop not found for user:', req.user.id);
             return res.json([]); 
        }

        const products = await prisma.product.findMany({
            where: { shopId: shop.id },
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                unit: true,
                images: true
            }
        });

        const productsWithImage = products.map(product => ({
            ...product,
            image: product.images.length > 0 
                ? (product.images.find(img => img.isPrimary)?.url || product.images[0].url) 
                : null
        }));

        res.json(productsWithImage);
    } catch (error) {
        console.error('Error fetching my-products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get all products (Admin/Debug)
// @route   GET /api/products
// @access  Private
router.get('/', async (req, res) => {
     try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                shop: { select: { name: true } },
                images: true
            }
        });
        
        const productsWithImage = products.map(product => ({
            ...product,
             image: product.images.length > 0 
                ? (product.images.find(img => img.isPrimary)?.url || product.images[0].url) 
                : null
        }));

        res.json(productsWithImage);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @desc    Get product by ID (Public)
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                shop: {
                    select: { name: true, slug: true, logo: true, address: true, isOpen: true }
                },
                images: true,
                unit: true,
                category: true
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productWithImage = {
            ...product,
            image: product.images.length > 0 
                ? (product.images.find(img => img.isPrimary)?.url || product.images[0].url) 
                : null
        };

        res.json(productWithImage);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @desc    Create a product
// @route   POST /api/products
// @access  Private
router.post('/', upload.array('images', 10), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const shop = await checkShopOwnership(req.user.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const { name, description, price, stock, weight, category, condition, unitId, isActive, isPreOrder, expiryInfo, expiresAt, trackStock } = req.body;

        const uploadDir = path.join('public', 'products', shop.slug);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const productImages = [];
        let mainImageUrl = null;

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const fileName = `prod-${Date.now()}-${i}.webp`;
                const filePath = path.join(uploadDir, fileName);

                await sharp(file.buffer)
                    .resize(800, 800, { fit: 'inside' })
                    .toFormat('webp')
                    .toFile(filePath);

                const imageUrl = `/products/${shop.slug}/${fileName}`;
                
                if (i === 0) mainImageUrl = imageUrl;
                
                productImages.push({
                    url: imageUrl,
                    isPrimary: i === 0
                });
            }
        }

        const productData = {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            weight: weight ? parseInt(weight) : 0,
            condition: condition || 'NEW',
            shopId: shop.id,
            isActive: isActive !== undefined ? isActive === 'true' : true,
            isPreOrder: isPreOrder === 'true',
            trackStock: trackStock !== undefined ? trackStock === 'true' : true,
            expiryInfo: expiryInfo || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            images: {
                create: productImages
            }
        };

        // Use scalar fields directly
        if (category) {
            productData.categoryId = category;
        }

        if (unitId) {
            productData.unitId = unitId;
        }

        const product = await prisma.product.create({
            data: productData,
            include: {
                images: true
            }
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', upload.array('images', 10), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const shop = await checkShopOwnership(req.user.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const { id } = req.params;
        const { name, description, price, stock, weight, category, condition, unitId, isActive, isPreOrder, expiryInfo, expiresAt, deletedImageIds, trackStock } = req.body;

        const product = await prisma.product.findUnique({ 
            where: { id },
             include: { images: true } 
        });

        if (!product || product.shopId !== shop.id) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        // Handle Image Deletions
        if (deletedImageIds) {
            const idsToDelete = Array.isArray(deletedImageIds) ? deletedImageIds : [deletedImageIds];
            if (idsToDelete.length > 0) {
                 await prisma.productImage.deleteMany({
                    where: {
                        id: { in: idsToDelete },
                        productId: id
                    }
                });
                
                // Also delete files from filesystem if possible (optional but recommended)
                // For now, we skip filesystem deletion for simplicity or implement it later
            }
        }

        // Handle New Images
        if (req.files && req.files.length > 0) {
            const uploadDir = path.join('public', 'products', shop.slug);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const fileName = `prod-${Date.now()}-${i}.webp`;
                const filePath = path.join(uploadDir, fileName);

                await sharp(file.buffer)
                    .resize(800, 800, { fit: 'inside' })
                    .toFormat('webp')
                    .toFile(filePath);

                const imageUrl = `/products/${shop.slug}/${fileName}`;
                
                await prisma.productImage.create({
                    data: {
                        productId: id,
                        url: imageUrl,
                        isPrimary: false // New images are not primary by default unless set separately
                    }
                });
            }
        }

        const updateData = {
            name: name || product.name,
            description: description !== undefined ? description : product.description,
            price: price ? parseFloat(price) : product.price,
            stock: stock ? parseInt(stock) : product.stock,
            weight: weight ? parseInt(weight) : product.weight,
            condition: condition || product.condition,
            isActive: isActive !== undefined ? (typeof isActive === 'string' ? isActive === 'true' : !!isActive) : product.isActive,
            isPreOrder: isPreOrder !== undefined ? (typeof isPreOrder === 'string' ? isPreOrder === 'true' : !!isPreOrder) : product.isPreOrder,
            trackStock: trackStock !== undefined ? (typeof trackStock === 'string' ? trackStock === 'true' : !!trackStock) : product.trackStock,
            expiryInfo: expiryInfo !== undefined ? expiryInfo : product.expiryInfo,
            expiresAt: expiresAt ? new Date(expiresAt) : (expiresAt === null ? null : product.expiresAt),
        };

        if (category) {
            updateData.categoryId = category;
        }

        if (unitId) {
            updateData.unitId = unitId;
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
            include: { images: true }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const shop = await checkShopOwnership(req.user.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product || product.shopId !== shop.id) {
            return res.status(404).json({ message: 'Product not found or unauthorized' });
        }

        await prisma.product.delete({ where: { id } });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
