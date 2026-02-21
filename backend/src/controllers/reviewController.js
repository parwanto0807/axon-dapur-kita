import prisma from '../config/db.js';

/**
 * Get all reviews for a shop
 */
export const getShopReviews = async (req, res) => {
    const { shopId } = req.params;

    try {
        const reviews = await prisma.review.findMany({
            where: {
                product: { shopId }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                },
                product: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching shop reviews:', error);
        res.status(500).json({ message: 'Gagal memuat ulasan toko' });
    }
};

/**
 * Create a new review for a product
 */
export const createReview = async (req, res) => {
    const { productId, rating, comment, images, orderId } = req.body;
    const userId = req.user.id;

    if (!productId || !rating) {
        return res.status(400).json({ message: 'Product ID dan rating wajib diisi' });
    }

    try {
        // Optional: Check if user actually bought the product
        const hasBought = await prisma.order.findFirst({
            where: {
                userId,
                status: 'completed',
                items: {
                    some: { productId }
                }
            }
        });

        if (!hasBought) {
            return res.status(403).json({ message: 'Anda hanya dapat memberikan ulasan untuk produk yang sudah dibeli dan selesai' });
        }

        // Check if already reviewed for this product (to avoid duplicates if desired)
        const existingReview = await prisma.review.findFirst({
            where: { userId, productId, orderId }
        });

        if (existingReview) {
            return res.status(400).json({ message: 'Anda sudah memberikan ulasan untuk produk ini di pesanan ini' });
        }

        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                images: images || [],
                userId,
                productId,
                orderId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Gagal membuat ulasan' });
    }
};

/**
 * Get reviews for a specific product
 */
export const getProductReviews = async (req, res) => {
    const { productId } = req.params;

    try {
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate average
        const aggregate = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        res.json({
            reviews,
            averageRating: aggregate._avg.rating || 0,
            totalReviews: aggregate._count.rating || 0
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Gagal memuat ulasan' });
    }
};

/**
 * Get shop statistics (Average rating, total sales)
 */
export const getShopStats = async (req, res) => {
    const { shopId } = req.params;

    try {
        console.log('Fetching stats for shopId:', shopId);
        const aggregate = await prisma.review.aggregate({
            where: {
                product: {
                    shopId: shopId
                }
            },
            _avg: { rating: true },
            _count: { rating: true }
        });

        // Use 'completed' status if it exists, otherwise fallback to paymentStatus
        const totalOrders = await prisma.order.count({
            where: { 
                shopId: shopId, 
                OR: [
                    { status: 'completed' },
                    { paymentStatus: 'paid' }
                ]
            }
        });

        console.log('Stats aggregated:', aggregate, 'Total orders:', totalOrders);

        res.json({
            averageRating: aggregate._avg?.rating || 0,
            totalReviews: aggregate._count?.rating || 0,
            totalCompletedOrders: totalOrders
        });
    } catch (error) {
        console.error('CRITICAL: Error fetching shop stats:', error);
        res.status(500).json({ message: 'Gagal memuat statistik toko', error: error.message });
    }
};
