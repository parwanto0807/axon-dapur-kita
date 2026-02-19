import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      shippingAddress: true,
      user: { select: { name: true } }
    }
  });

  /* console.log('--- RECENT ORDERS DEBUG ---');
  orders.forEach(order => {
    console.log(`Order ID: ${order.id}`);
    console.log(`User: ${order.user?.name}`);
    console.log('Shipping Address:', JSON.stringify(order.shippingAddress, null, 2));
    console.log('---------------------------');
  }); */

  // Save to file to avoid encoding issues
  const fs = await import('fs');
  fs.writeFileSync('address_dump.json', JSON.stringify(orders, null, 2));
  console.log('Dumped to address_dump.json');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
