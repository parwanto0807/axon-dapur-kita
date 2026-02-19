
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing category query...');
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        
        console.log(`Categories found: ${categories.length}`);
        if (categories.length > 0) {
            console.log('Sample category:', JSON.stringify(categories[0], null, 2));
            
            // Test sorting logic
            const sorted = categories.sort((a, b) => b._count.products - a._count.products);
            console.log('Sorting logic executed successfully.');
            console.log('Top category:', sorted[0].name, 'Count:', sorted[0]._count.products);
        } else {
            console.log('No categories found in database.');
        }
        
    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
