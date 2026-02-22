import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// === KATEGORI UTAMA (Parent) ===
const parentCategories = [
    { name: 'Makanan Berat', slug: 'makanan-berat', icon: 'CookingPot' },
    { name: 'Hidangan Berkuah', slug: 'hidangan-berkuah', icon: 'Soup' },
    { name: 'Camilan & Gorengan', slug: 'camilan-gorengan', icon: 'Cookie' },
    { name: 'Kue & Jajanan Pasar', slug: 'kue-jajanan-pasar', icon: 'Croissant' },
    { name: 'Minuman', slug: 'minuman', icon: 'CupSoda' },
    { name: 'Bumbu & Rempah', slug: 'bumbu-rempah', icon: 'Utensils' },
    { name: 'Lauk Mentah & Protein', slug: 'lauk-mentah', icon: 'Fish' },
    { name: 'Bahan Pokok', slug: 'bahan-pokok', icon: 'Wheat' },
    { name: 'Frozen Food', slug: 'frozen-food', icon: 'Snowflake' },
    { name: 'Paket & Bundling', slug: 'paket-bundling', icon: 'Package' },
    { name: 'Jamu & Herbal', slug: 'jamu-herbal', icon: 'Leaf' },
];

// === SUB-KATEGORI (Child) — slug parent harus ada di list atas ===
const subCategories = [
    // Makanan Berat
    { name: 'Nasi & Aneka Lauk', slug: 'nasi-lauk', parentSlug: 'makanan-berat' },
    { name: 'Olahan Ayam', slug: 'olahan-ayam', parentSlug: 'makanan-berat' },
    { name: 'Olahan Daging', slug: 'olahan-daging', parentSlug: 'makanan-berat' },
    { name: 'Olahan Ikan & Seafood', slug: 'olahan-ikan-seafood', parentSlug: 'makanan-berat' },
    { name: 'Olahan Tahu & Tempe', slug: 'olahan-tahu-tempe', parentSlug: 'makanan-berat' },
    { name: 'Sayuran Siap Santap', slug: 'sayuran-siap-santap', parentSlug: 'makanan-berat' },

    // Hidangan Berkuah
    { name: 'Soto & Rawon', slug: 'soto-rawon', parentSlug: 'hidangan-berkuah' },
    { name: 'Sop & Sup', slug: 'sop-sup', parentSlug: 'hidangan-berkuah' },
    { name: 'Bakso & Mie Ayam', slug: 'bakso-mie', parentSlug: 'hidangan-berkuah' },
    { name: 'Sayur Berkuah', slug: 'sayur-berkuah', parentSlug: 'hidangan-berkuah' },

    // Camilan & Gorengan
    { name: 'Gorengan', slug: 'gorengan', parentSlug: 'camilan-gorengan' },
    { name: 'Jajanan Tradisional', slug: 'jajanan-tradisional', parentSlug: 'camilan-gorengan' },
    { name: 'Snack Modern', slug: 'snack-modern', parentSlug: 'camilan-gorengan' },
    { name: 'Keripik & Rempeyek', slug: 'keripik-rempeyek', parentSlug: 'camilan-gorengan' },

    // Minuman
    { name: 'Minuman Dingin', slug: 'minuman-dingin', parentSlug: 'minuman' },
    { name: 'Minuman Hangat', slug: 'minuman-hangat', parentSlug: 'minuman' },
    { name: 'Minuman Kemasan UMKM', slug: 'minuman-kemasan', parentSlug: 'minuman' },

    // Bumbu & Rempah
    { name: 'Bumbu Giling Siap Pakai', slug: 'bumbu-giling', parentSlug: 'bumbu-rempah' },
    { name: 'Rempah Segar', slug: 'rempah-segar', parentSlug: 'bumbu-rempah' },

    // Lauk Mentah
    { name: 'Daging Segar', slug: 'daging-segar', parentSlug: 'lauk-mentah' },
    { name: 'Ikan & Seafood Segar', slug: 'ikan-seafood-segar', parentSlug: 'lauk-mentah' },
    { name: 'Telur & Produk Susu', slug: 'telur-susu', parentSlug: 'lauk-mentah' },

    // Bahan Pokok
    { name: 'Beras & Serealia', slug: 'beras-serealia', parentSlug: 'bahan-pokok' },
    { name: 'Tepung & Bihun', slug: 'tepung-bihun', parentSlug: 'bahan-pokok' },
    { name: 'Minyak & Lemak', slug: 'minyak-lemak', parentSlug: 'bahan-pokok' },
];

async function main() {
    console.log('🌿 Seeding categories (professional taxonomy)...');

    // Upsert parent categories
    const parentMap = {};
    for (const cat of parentCategories) {
        const result = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name, icon: cat.icon },
            create: { name: cat.name, slug: cat.slug, icon: cat.icon },
        });
        parentMap[cat.slug] = result.id;
        console.log(`✅ Parent: ${cat.name}`);
    }

    // Upsert sub-categories
    for (const sub of subCategories) {
        const parentId = parentMap[sub.parentSlug];
        if (!parentId) {
            console.warn(`⚠️  Parent not found for sub: ${sub.name} (parentSlug: ${sub.parentSlug})`);
            continue;
        }
        await prisma.category.upsert({
            where: { slug: sub.slug },
            update: { name: sub.name, parentId },
            create: { name: sub.name, slug: sub.slug, parentId },
        });
        console.log(`  ↳ Sub: ${sub.name}`);
    }

    console.log('\n✨ Category seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
