import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    { name: 'Lauk Mateng', slug: 'lauk-mateng' },
    { name: 'Sayuran Segar', slug: 'sayuran-segar' },
    { name: 'Bumbu Dapur', slug: 'bumbu-dapur' },
    { name: 'Buah-buahan', slug: 'buah-buahan' },
    { name: 'Beras', slug: 'beras' },
    { name: 'Sembako', slug: 'sembako' },
    { name: 'Minyak Goreng', slug: 'minyak-goreng' },
    { name: 'Daging & Ikan', slug: 'daging-ikan' },
    { name: 'Telur & Susu', slug: 'telur-susu' },
    { name: 'Makanan Berat', slug: 'makanan-berat' },
    { name: 'Minuman', slug: 'minuman' },
    { name: 'Cemilan', slug: 'cemilan' },
    { name: 'Frozen Food', slug: 'frozen-food' },
    { name: 'Katering', slug: 'katering' },
    { name: 'Kue & Roti', slug: 'kue-roti' },
    { name: 'Jajanan Pasar', slug: 'jajanan-pasar' }
];

async function main() {
    console.log('Start seeding categories...');
    for (const cat of categories) {
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug }
        });
        if (!existing) {
            await prisma.category.create({
                data: cat
            });
            console.log(`Created category: ${cat.name}`);
        } else {
            console.log(`Category exists: ${cat.name}`);
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
