import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categoryCount = await prisma.category.count();
    const unitCount = await prisma.unit.count();
    console.log(`Categories: ${categoryCount}`);
    console.log(`Units: ${unitCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
