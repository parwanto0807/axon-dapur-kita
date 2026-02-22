import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get admin dashboard statistics
export const getStatistics = async (req, res) => {
    try {
        // Get total shops
        const totalShops = await prisma.shop.count();

        // Get total products
        const totalProducts = await prisma.product.count();

        // Get total transactions (orders)
        const totalOrders = await prisma.order.count();
        
        // Get total transaction amount
        const totalAmountResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true
            }
        });
        const totalAmount = totalAmountResult._sum.totalAmount || 0;

        // Get total users
        const totalUsers = await prisma.user.count();

        // Get recent activities
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    select: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                shop: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Get newly registered shops
        const newShops = await prisma.shop.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true
            }
        });

        // Get recent products
        const newProducts = await prisma.product.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                shop: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Count shops by status
        const shopsByStatus = await prisma.shop.groupBy({
            by: ['status'],
            _count: true
        });

        // Count pending shops
        const pendingShops = shopsByStatus.find(s => s.status === 'PENDING')?._count || 0;

        // Get today's transaction amount
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrowStart = new Date(today);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);

        const todayTransactions = await prisma.order.aggregate({
            _sum: {
                totalAmount: true
            },
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrowStart
                }
            }
        });

        const todayAmount = todayTransactions._sum.totalAmount || 0;

        res.status(200).json({
            stats: {
                totalShops,
                totalProducts,
                totalOrders,
                totalAmount,
                totalUsers,
                pendingShops,
                todayAmount
            },
            activities: {
                recentOrders: recentOrders.map(order => ({
                    id: order.id,
                    title: `Pesanan Baru dari ${order.shop.name}`,
                    detail: order.items[0]?.product.name || 'Pesanan baru',
                    time: getTimeAgo(order.createdAt),
                    type: 'order'
                })),
                newShops: newShops.map(shop => ({
                    id: shop.id,
                    title: `Toko Baru: ${shop.name}`,
                    detail: shop.status === 'PENDING' ? 'Menunggu persetujuan' : 'Sudah disetujui',
                    time: getTimeAgo(shop.createdAt),
                    type: 'shop'
                })),
                newProducts: newProducts.map(product => ({
                    id: product.id,
                    title: `Produk Baru dari ${product.shop.name}`,
                    detail: product.name,
                    time: getTimeAgo(product.createdAt),
                    type: 'product'
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching admin statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

// Helper function to get time ago
const getTimeAgo = (date) => {
    const now = new Date();
    const secondsAgo = Math.floor((now - new Date(date)) / 1000);
    
    if (secondsAgo < 60) return 'Baru saja';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m lalu`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h lalu`;
    return `${Math.floor(secondsAgo / 86400)}d lalu`;
};
