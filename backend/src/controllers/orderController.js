import prisma from '../config/db.js';
import { emitNewOrder, emitOrderStatusUpdate, emitShopEvent } from '../socket.js';
import { createNotification } from './notificationController.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


/**
 * Create a new order with multiple items
 * Includes stock validation and price snapshotting in a transaction
 * SUPPORTS MULTI-SHOP ORDERS
 */
export const createOrder = async (req, res) => {
    const { items, paymentMethod, shippingAddress, notes, shippingMethod } = req.body;
    const userId = req.user.id;

    if (!items || !items.length) {
        return res.status(400).json({ message: 'Keranjang belanja kosong' });
    }

    try {
        // Group items by shopId
        const itemsByShop = {};
        
        // Pre-fetch product details to group them
        const productIds = items.map(item => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { shop: true }
        });

        // Map for quick lookup
        const productMap = {};
        products.forEach(p => productMap[p.id] = p);

        // Grouping logic
        for (const item of items) {
            const product = productMap[item.productId];
            if (!product) {
                return res.status(400).json({ message: `Produk dengan ID ${item.productId} tidak ditemukan` });
            }
            
            if (!itemsByShop[product.shopId]) {
                itemsByShop[product.shopId] = {
                    shopId: product.shopId,
                    shopName: product.shop.name, // meaningful for notifications
                    items: []
                };
            }
            itemsByShop[product.shopId].items.push(item);
        }

        // Execute transactions for ALL orders
        const createdOrders = await prisma.$transaction(async (tx) => {
            const results = [];

            for (const shopId of Object.keys(itemsByShop)) {
                const shopGroup = itemsByShop[shopId];
                let totalAmount = 0;
                let totalCommission = 0;
                const orderItemsData = [];

                for (const item of shopGroup.items) {
                    // Re-fetch with lock inside transaction if needed, or rely on optimistic/pessimistic locking
                    // For now, simpler fetch within transaction to ensure data integrity
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                        include: { shop: true }
                    });

                    if (product.trackStock && product.stock < item.quantity) {
                         throw new Error(`Stok produk "${product.name}" tidak mencukupi (Tersedia: ${product.stock})`);
                    }

                    const subtotal = Number(product.price) * item.quantity;
                    totalAmount += subtotal;

                    // Calculate commission
                    const itemCommission = subtotal * (product.shop.commissionRate || 0.05);
                    totalCommission += itemCommission;

                    orderItemsData.push({
                        productId: product.id,
                        quantity: item.quantity,
                        price: product.price,
                        subtotal: subtotal
                    });

                    // Deduct Stock
                    if (product.trackStock) {
                        await tx.product.update({
                            where: { id: product.id },
                            data: { stock: { decrement: item.quantity } }
                        });

                        await tx.stockLog.create({
                            data: {
                                productId: product.id,
                                shopId: product.shopId,
                                quantity: -item.quantity,
                                type: 'SALE'
                            }
                        });
                    }
                }

                const netAmount = totalAmount - totalCommission;

                // Create Order for this Shop
                const order = await tx.order.create({
                    data: {
                        userId,
                        shopId: shopGroup.shopId,
                        totalAmount,
                        commission: totalCommission,
                        netAmount,
                        paymentMethod,
                        paymentStatus: 'pending',
                        deliveryStatus: 'pending',
                        status: 'pending',
                        shippingAddress: shippingAddress || {},
                        notes,
                        shippingMethod: shippingMethod || 'seller',
                        items: {
                            create: orderItemsData
                        }
                    },
                    include: {
                        shop: true,
                        items: {
                            include: {
                                product: {
                                    include: { images: true }
                                }
                            }
                        }
                    }
                });

                results.push(order);
            }
            return results;
        });

        // POST-TRANSACTION: Emit events and notifications for EACH order
        for (const order of createdOrders) {
            // 1. Emit real-time update to the specific merchant room
            console.log(`[OrderController] Emitting new_order to shop room: shop_${order.shopId}`);
            emitNewOrder(order.shopId, {
                id: order.id,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                itemCount: order.items.length,
                user: { name: req.user.name },
                _timestamp: new Date().toISOString()
            });

            // 2. Create notification for shop owner
            try {
                const shopOwner = await prisma.user.findFirst({
                    where: { shopId: order.shopId }
                });

                if (shopOwner) {
                    await createNotification({
                        userId: shopOwner.id,
                        title: 'Pesanan Baru!',
                        body: `Pesanan #${order.id.slice(-6).toUpperCase()} baru saja masuk dari ${req.user.name}. Segera proses!`,
                        type: 'ORDER_NEW',
                        link: `/dashboard/merchant/orders`
                    });
                    console.log(`[OrderController] Success: Created notification for shop owner ${shopOwner.id}`);
                } else {
                    console.warn(`[OrderController] Warning: Shop owner not found for shopId ${order.shopId}`);
                }
            } catch (notifError) {
                console.error('[OrderController] Error creating shop notification:', notifError);
            }
        }

        // Return array of orders (Frontend must update to handle array)
        res.status(201).json({ orders: createdOrders });

    } catch (error) {
        console.error('[OrderController] Error creating order:', error);
        res.status(400).json({ message: error.message || 'Gagal melakukan checkout' });
    }
};

/**
 * Get order details by ID
 */
export const getOrderDetails = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: {
                shop: {
                    include: {
                        owner: {
                            select: {
                                whatsapp: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        whatsapp: true
                    }
                },
                reviews: true,
                items: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        // Security: Only the buyer OR the shop owner can see order details
        const shopOwnerId = order.shop?.owner ? 
            (await prisma.user.findFirst({ where: { shopId: order.shopId }, select: { id: true } }))?.id 
            : null;
        const isBuyer = order.userId === req.user.id;
        const isShopOwner = shopOwnerId === req.user.id;
        const isAdmin = req.user.role === 'ADMIN';
        
        if (!isBuyer && !isShopOwner && !isAdmin) {
            return res.status(403).json({ message: 'Akses ditolak: Anda tidak berhak melihat pesanan ini' });
        }

        const orderWithStatus = {
            ...order,
            hasShopReview: order.reviews.some(r => r.shopId === order.shopId && !r.productId),
            items: order.items.map(item => ({
                ...item,
                hasReview: order.reviews.some(r => r.productId === item.productId)
            }))
        };

        res.json(orderWithStatus);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Server error fetching order details' });
    }
};

/**
 * Get user orders (with pagination)
 */
export const getMyOrders = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
        const skip = (page - 1) * pageSize;

        const where = { userId: req.user.id };

        const [orders, total, stats] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    shop: {
                        include: {
                            owner: { select: { whatsapp: true } }
                        }
                    },
                    reviews: true,
                    items: {
                        include: {
                            product: { include: { images: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.order.count({ where }),
            prisma.order.groupBy({
                by: ['paymentStatus'],
                where: { userId: req.user.id },
                _count: { id: true }
            })
        ]);

        const statsFormatted = stats.reduce((acc, curr) => {
            acc[curr.paymentStatus] = curr._count.id;
            return acc;
        }, { all: total });

        const ordersWithStatus = orders.map(order => ({
            ...order,
            hasShopReview: order.reviews.some(r => r.shopId === order.shopId && !r.productId),
            items: order.items.map(item => ({
                ...item,
                hasReview: order.reviews.some(r => r.productId === item.productId)
            }))
        }));

        res.json({
            data: ordersWithStatus,
            total,
            stats: statsFormatted,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};
/**
 * Get orders for a specific shop (Merchant view — with pagination & server-side filter)
 */
export const getShopOrders = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 20));
        const skip = (page - 1) * pageSize;
        const { status, search } = req.query;

        // Find shop owned by current user
        const userWithShop = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { shop: true }
        });

        const shop = userWithShop?.shop;

        if (!shop) {
            return res.status(404).json({ message: 'Toko tidak ditemukan atau Anda bukan pemilik toko' });
        }

        // Build server-side where clause
        const where = {
            shopId: shop.id,
            ...(status && status !== 'all' && { paymentStatus: status }),
            ...(search && {
                OR: [
                    { id: { contains: search, mode: 'insensitive' } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ]
            })
        };

        const [orders, total, stats] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, whatsapp: true, image: true }
                    },
                    items: {
                        include: {
                            product: { include: { images: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.order.count({ where: { shopId: shop.id } }),
            prisma.order.groupBy({
                by: ['paymentStatus'],
                where: { shopId: shop.id },
                _count: { id: true }
            })
        ]);

        const statsFormatted = stats.reduce((acc, curr) => {
            acc[curr.paymentStatus] = curr._count.id;
            return acc;
        }, { all: total });

        res.json({
            data: orders,
            total,
            stats: statsFormatted,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        console.error('ERROR in getShopOrders:', error);
        res.status(500).json({ message: 'Server error fetching shop orders' });
    }
};

/**
 * Update order status (Merchant action)
 */
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { paymentStatus, deliveryStatus } = req.body;

    if (!paymentStatus && !deliveryStatus) {
        return res.status(400).json({ message: 'Tidak ada status yang diubah' });
    }

    try {
        // Find shop owned by current user
        const shop = await prisma.shop.findFirst({
            where: { owner: { id: req.user.id } }
        });

        if (!shop) {
            return res.status(403).json({ message: 'Hanya pemilik toko yang dapat mengubah status pesanan' });
        }

        // Validate order belongs to this shop
        const order = await prisma.order.findUnique({
            where: { id },
            include: { shop: true, user: true }
        });

        if (!order || order.shopId !== shop.id) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan di toko Anda' });
        }

        // Build update data — only update fields that were provided
        const updateData = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
        
        // Logical mapping to main status
        if (paymentStatus === 'paid' && deliveryStatus === 'delivered') {
            updateData.status = 'completed';
        } else if (paymentStatus === 'failed') {
            updateData.status = 'cancelled';
        } else if (deliveryStatus === 'shipped') {
            updateData.status = 'processing';
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                user: true,
                shop: true,
                items: {
                    include: { product: true }
                }
            }
        });

        const shopName = updatedOrder.shop?.name || shop.name || 'Toko';

        console.log(`[OrderController] Emitting order_updated to buyer room: user_${updatedOrder.userId}`);
        // Emit real-time update to the BUYER
        emitOrderStatusUpdate(updatedOrder.userId, {
            id: updatedOrder.id,
            paymentStatus: updatedOrder.paymentStatus,
            deliveryStatus: updatedOrder.deliveryStatus,
            shopName
        });

        // Create notification for BUYER
        try {
            const statusLabel = paymentStatus
                ? `pembayaran menjadi ${paymentStatus.toUpperCase()}`
                : `pengiriman menjadi ${deliveryStatus.toUpperCase()}`;
            await createNotification({
                userId: updatedOrder.userId,
                title: 'Update Status Pesanan',
                body: `Pesanan #${updatedOrder.id.slice(-6).toUpperCase()} dari ${shopName}: status ${statusLabel}`,
                type: 'ORDER_UPDATE',
                link: `/dashboard/orders/${updatedOrder.id}`
            });
            console.log(`[OrderController] Buyer notification created for user ${updatedOrder.userId}`);
        } catch (error) {
            console.error('[OrderController] Error creating buyer notification:', error);
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error('[OrderController] Error updating order status:', error);
        res.status(500).json({ message: 'Server error updating order status' });
    }
};

/**
 * User uploads payment proof (User -> Seller)
 */
export const uploadPaymentProof = async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Tidak ada file bukti pembayaran yang diunggah' });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { shop: true, user: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke pesanan ini' });
        }

        // Process image with sharp
        const uploadDir = path.join(__dirname, '../../', 'public', 'payments');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `proof_${order.id}_${Date.now()}.webp`;
        const filePath = path.join(uploadDir, fileName);

        await sharp(req.file.buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filePath);

        const paymentProofPath = `/payments/${fileName}`;

        // Update order
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                paymentProof: paymentProofPath,
                updatedAt: new Date()
            },
            include: { shop: true, user: true }
        });

        // Notify Seller
        emitShopEvent(updatedOrder.shopId, 'payment_proof_uploaded', updatedOrder);
        
        const shopOwner = await prisma.user.findFirst({
            where: { shopId: order.shopId }
        });

        if (shopOwner) {
            await createNotification({
                userId: shopOwner.id,
                title: 'Bukti Pembayaran Baru',
                body: `Buyer ${req.user.name} telah mengunggah bukti pembayaran untuk Order #${order.id.slice(-6).toUpperCase()}`,
                type: 'ORDER_PAYMENT',
                link: `/dashboard/merchant/orders/${order.id}`
            });
        }

        res.json(updatedOrder);

    } catch (error) {
        console.error('[OrderController] Error uploading payment proof:', error);
        res.status(500).json({ message: 'Gagal mengunggah bukti pembayaran' });
    }
};

/**
 * Seller verifies payment (Seller -> User)
 */
export const verifyPayment = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { shop: true, user: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        // Verify that the user owns the shop
        if (order.shopId !== req.user.shopId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Anda tidak memiliki akses untuk memverifikasi pesanan ini' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                paymentStatus: 'paid',
                updatedAt: new Date()
            },
            include: { shop: true, user: true }
        });

        // Notify Buyer
        emitOrderStatusUpdate(updatedOrder.userId, {
            id: updatedOrder.id,
            paymentStatus: 'paid',
            shopName: updatedOrder.shop.name
        });

        await createNotification({
            userId: updatedOrder.userId,
            title: 'Pembayaran Diterima',
            body: `Pembayaran Anda untuk Order #${order.id.slice(-6).toUpperCase()} telah dikonfirmasi oleh ${updatedOrder.shop.name}`,
            type: 'ORDER_UPDATE',
            link: `/dashboard/orders/${order.id}`
        });

        res.json(updatedOrder);

    } catch (error) {
        console.error('[OrderController] Error verifying payment:', error);
        res.status(500).json({ message: 'Gagal memverifikasi pembayaran' });
    }
};

/**
 * User confirms payment (Legacy / Simple confirm)
 */
export const confirmPayment = async (req, res) => {
    const { id } = req.params;
    
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { shop: true, user: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke pesanan ini' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                paymentStatus: 'paid',
                updatedAt: new Date()
            },
            include: { shop: true, user: true }
        });

        // Notifications ... (re-using existing logic)
        emitShopEvent(updatedOrder.shopId, 'payment_confirmed', updatedOrder);
        
         emitOrderStatusUpdate(req.user.id, {
            id: updatedOrder.id,
            paymentStatus: updatedOrder.paymentStatus,
            shopName: updatedOrder.shop.name
        });
        
        const shopOwner = await prisma.user.findFirst({
            where: { shopId: order.shopId }
        });

        if (shopOwner) {
            await createNotification({
                userId: shopOwner.id,
                title: 'Pembayaran Dikonfirmasi Buyer',
                body: `Buyer ${req.user.name} telah mengonfirmasi pembayaran untuk Order #${order.id.slice(-6).toUpperCase()}`,
                type: 'ORDER_PAYMENT',
                link: `/dashboard/merchant/orders/${order.id}`
            });
        }

        res.json(updatedOrder);

    } catch (error) {
        console.error('[OrderController] Error confirming payment:', error);
        res.status(500).json({ message: 'Gagal mengonfirmasi pembayaran' });
    }
};

/**
 * User receives order (User -> Seller)
 */
export const receiveOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { shop: true }
        });

        if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        if (order.userId !== req.user.id) return res.status(403).json({ message: 'Akses ditolak' });

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { 
                deliveryStatus: 'delivered',
                paymentStatus: 'paid', // Mark as paid if received (safety)
                status: 'completed',
                updatedAt: new Date()
            },
            include: { shop: true }
        });

        // Emit to Seller
        emitShopEvent(order.shopId, 'order_completed', updatedOrder);

        // Emit to Buyer (Self-sync)
        emitOrderStatusUpdate(req.user.id, {
            id: updatedOrder.id,
            deliveryStatus: updatedOrder.deliveryStatus,
            status: updatedOrder.status,
            shopName: order.shop.name
        });

        // Notification to Seller
        // Need to find shop owner first
        const shop = await prisma.shop.findUnique({
            where: { id: order.shopId },
            include: { owner: true } // Assuming relation exists
        });

        if (shop && shop.owner) {
             await createNotification({
                userId: shop.owner.id,
                title: 'Pesanan Diterima!',
                body: `Order #${order.id.slice(-6).toUpperCase()} telah diterima oleh pembeli. Transaksi Selesai.`,
                type: 'ORDER_COMPLETED',
                link: `/dashboard/merchant/orders/${order.id}`
            });
        }

        res.json(updatedOrder);

    } catch (error) {
        console.error('[OrderController] Error receiving order:', error);
        res.status(500).json({ message: 'Gagal menyelesaikan pesanan' });
    }
};

/**
 * Cancel order (Buyer or Seller)
 * Buyer: Only if all statuses are 'pending'
 * Seller: If deliveryStatus hasn't reached 'shipped'
 */
export const cancelOrder = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userShopId = req.user.shopId;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { 
                items: {
                    include: { product: true }
                },
                shop: true 
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
        }

        const isBuyer = order.userId === userId;
        const isMerchant = order.shopId === userShopId;

        if (!isBuyer && !isMerchant) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses ke pesanan ini' });
        }

        // Validation based on role
        if (isBuyer) {
            // Buyer can only cancel if NOTHING has happened yet
            if (order.status !== 'pending' || order.paymentStatus !== 'pending' || order.deliveryStatus !== 'pending') {
                return res.status(400).json({ message: 'Pesanan tidak dapat dibatalkan karena sudah dalam proses' });
            }
        } else if (isMerchant) {
            // Merchant can cancel as long as it's not shipped/completed/cancelled
            if (['shipped', 'delivered', 'completed'].includes(order.deliveryStatus)) {
                return res.status(400).json({ message: 'Pesanan sudah dikirim atau selesai, tidak dapat dibatalkan' });
            }
            if (order.status === 'cancelled' || order.status === 'failed') {
                return res.status(400).json({ message: 'Pesanan sudah dibatalkan' });
            }
        }

        // Use transaction for status update and stock return
        const cancelledOrder = await prisma.$transaction(async (tx) => {
            // 1. Update order status
            const updated = await tx.order.update({
                where: { id },
                data: {
                    status: 'cancelled',
                    paymentStatus: 'failed',
                    deliveryStatus: 'cancelled',
                    updatedAt: new Date()
                },
                include: { shop: true, user: true }
            });

            // 2. Return stock for each item
            for (const item of order.items) {
                if (item.product.trackStock) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });

                    await tx.stockLog.create({
                        data: {
                            productId: item.productId,
                            shopId: order.shopId,
                            quantity: item.quantity,
                            type: 'CANCEL_RETURN'
                        }
                    });
                }
            }

            return updated;
        });

        // 3. Notify the other party
        if (isBuyer) {
            // Notify Merchant
            emitShopEvent(order.shopId, 'order_cancelled', cancelledOrder);
            const shopOwner = await prisma.user.findFirst({
                where: { shopId: order.shopId }
            });

            if (shopOwner) {
                await createNotification({
                    userId: shopOwner.id,
                    title: 'Pesanan Dibatalkan Pembeli',
                    body: `Order #${order.id.slice(-6).toUpperCase()} telah dibatalkan oleh pembeli. Stok telah dikembalikan.`,
                    type: 'ORDER_CANCEL',
                    link: `/dashboard/merchant/orders/${order.id}`
                });
            }
        } else {
            // Notify Buyer
            emitOrderStatusUpdate(order.userId, {
                id: order.id,
                status: 'cancelled',
                paymentStatus: 'failed',
                shopName: order.shop.name
            });

            // ALSO notify other Merchant sessions/tabs
            emitShopEvent(order.shopId, 'order_cancelled', cancelledOrder);

            await createNotification({
                userId: order.userId,
                title: 'Pesanan Dibatalkan Penjual',
                body: `Pesanan #${order.id.slice(-6).toUpperCase()} telah dibatalkan oleh ${order.shop.name}. Stok telah dikembalikan.`,
                type: 'ORDER_CANCEL',
                link: `/dashboard/orders/${order.id}`
            });
        }

        res.json({ message: 'Pesanan berhasil dibatalkan', order: cancelledOrder });

    } catch (error) {
        console.error('[OrderController] Error cancelling order:', error);
        res.status(500).json({ message: 'Gagal membatalkan pesanan' });
    }
};
