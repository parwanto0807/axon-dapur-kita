import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const units = [
    { name: 'pcs' },
    { name: 'kg' },
    { name: 'gr' },
    { name: 'bks' }, // Bungkus
    { name: 'btl' }, // Botol
    { name: 'pack' },
    { name: 'porsi' },
    { name: 'liter' },
    { name: 'ml' },
    { name: 'lusin' },
    { name: 'kodi' },
    { name: 'rim' },
    { name: 'box' },
    { name: 'ikat' },
    { name: 'karung' },
    { name: 'ons' }
];

async function main() {
    console.log('Start seeding units...');
    for (const unit of units) {
        const existing = await prisma.unit.findUnique({
            where: { name: unit.name }
        });
        if (!existing) {
            await prisma.unit.create({
                data: unit
            });
            console.log(`Created unit: ${unit.name}`);
        } else {
            console.log(`Unit exists: ${unit.name}`);
        }
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
