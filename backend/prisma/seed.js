import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // --- Units ---
  const units = [
    { name: 'pcs' },
    { name: 'kg' },
    { name: 'gram' },
    { name: 'ikat' },
    { name: 'liter' },
    { name: 'ml' },
    { name: 'pack' },
    { name: 'box' },
    { name: 'lusin' },
    { name: 'botol' },
    { name: 'kaleng' },
    { name: 'sachet' },
  ]

  console.log('Seeding Units...')
  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit,
    })
  }

  // --- Categories ---
  const categories = [
    { name: 'Sayur Mayur', slug: 'sayur-mayur' },
    { name: 'Buah-buahan', slug: 'buah-buahan' },
    { name: 'Sembako', slug: 'sembako' },
    { name: 'Lauk Pauk', slug: 'lauk-pauk' },
    { name: 'Minuman', slug: 'minuman' },
    { name: 'Makanan Ringan', slug: 'makanan-ringan' },
    { name: 'Bumbu Dapur', slug: 'bumbu-dapur' },
    { name: 'Perlengkapan Rumah', slug: 'perlengkapan-rumah' },
    { name: 'Produk Beku', slug: 'produk-beku' },
    { name: 'Kesehatan', slug: 'kesehatan' },
  ]

  console.log('Seeding Categories...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
