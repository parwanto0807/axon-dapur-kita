import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Run every hour (at minute 0)
cron.schedule('0 * * * *', async () => {
    console.log('Running expiry check...');
    try {
        const now = new Date();

        // 1. Find expired products that are still active or have stock > 0
        const expiredProducts = await prisma.product.findMany({
            where: {
                expiresAt: { lt: now }, // Expired
                OR: [
                    { isActive: true },
                    { stock: { gt: 0 } }
                ]
            }
        });

        console.log(`Found ${expiredProducts.length} expired products.`);

        for (const product of expiredProducts) {
            // Transaction to ensure data integrity
            await prisma.$transaction(async (tx) => {
                // a. Create StockLog for the remaining stock (waste)
                if (product.stock > 0) {
                    await tx.stockLog.create({
                        data: {
                            quantity: -product.stock, // Negative because it's removed
                            type: 'EXPIRED',
                            productId: product.id,
                            shopId: product.shopId
                        }
                    });
                }

                // b. Update Product: stock 0, isActive false
                await tx.product.update({
                    where: { id: product.id },
                    data: {
                        stock: 0,
                        isActive: false
                        // We keep expiresAt as history or could clear it. Keeping it is better for trace.
                    }
                });
            });
            console.log(`Processed expiry for product: ${product.name} (${product.id})`);
        }

    } catch (error) {
        console.error('Error in expiry cron job:', error);
    }
});

console.log('Cron jobs initialized.');
