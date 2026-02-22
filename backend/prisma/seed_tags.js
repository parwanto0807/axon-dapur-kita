import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tags = [
    // === CHARACTERISTIC ===
    { name: 'Pedas', slug: 'pedas', type: 'CHARACTERISTIC' },
    { name: 'Tidak Pedas', slug: 'tidak-pedas', type: 'CHARACTERISTIC' },
    { name: 'Ada Nasi', slug: 'ada-nasi', type: 'CHARACTERISTIC' },
    { name: 'Vegetarian', slug: 'vegetarian', type: 'CHARACTERISTIC' },
    { name: 'Vegan', slug: 'vegan', type: 'CHARACTERISTIC' },
    { name: 'Halal Certified', slug: 'halal-certified', type: 'CHARACTERISTIC' },
    { name: 'Khas Daerah', slug: 'khas-daerah', type: 'CHARACTERISTIC' },
    { name: 'Homemade', slug: 'homemade', type: 'CHARACTERISTIC' },
    { name: 'Tanpa Pengawet', slug: 'tanpa-pengawet', type: 'CHARACTERISTIC' },
    { name: 'Siap Makan', slug: 'siap-makan', type: 'CHARACTERISTIC' },
    { name: 'Perlu Masak Lagi', slug: 'perlu-masak', type: 'CHARACTERISTIC' },
    { name: 'Porsi Besar', slug: 'porsi-besar', type: 'CHARACTERISTIC' },
    { name: 'Porsi Kecil', slug: 'porsi-kecil', type: 'CHARACTERISTIC' },

    // === EVENT ===
    { name: 'Menu Sahur', slug: 'menu-sahur', type: 'EVENT' },
    { name: 'Menu Buka Puasa', slug: 'menu-buka-puasa', type: 'EVENT' },
    { name: 'Hajatan / Prasmanan', slug: 'hajatan', type: 'EVENT' },
    { name: 'Oleh-Oleh', slug: 'oleh-oleh', type: 'EVENT' },
    { name: 'Nasi Kotak', slug: 'nasi-kotak', type: 'EVENT' },
    { name: 'Catering Harian', slug: 'catering-harian', type: 'EVENT' },

    // === DIET ===
    { name: 'Organik', slug: 'organik', type: 'DIET' },
    { name: 'Bebas Gluten', slug: 'bebas-gluten', type: 'DIET' },
    { name: 'Rendah Kalori', slug: 'rendah-kalori', type: 'DIET' },
    { name: 'Rendah Gula', slug: 'rendah-gula', type: 'DIET' },
    { name: 'Tinggi Protein', slug: 'tinggi-protein', type: 'DIET' },
];

async function main() {
    console.log('🏷️  Seeding tags...');
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { slug: tag.slug },
            update: { name: tag.name, type: tag.type },
            create: tag,
        });
        console.log(`✅ Tag: [${tag.type}] ${tag.name}`);
    }
    console.log('\n✨ Tag seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
