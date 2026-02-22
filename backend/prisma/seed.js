import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const unitGroups = [
    {
        group: 'BERAT',
        units: [
            { name: 'Gram', symbol: 'gr', subGroup: 'Berat Kecil', isFractionAllowed: true, decimalPlaces: 0, conversionBase: 'gr', conversionRate: 1 },
            { name: 'Ons', symbol: 'ons', subGroup: 'Berat Kecil', isFractionAllowed: true, decimalPlaces: 1, conversionBase: 'gr', conversionRate: 100 },
            { name: 'Kilogram', symbol: 'kg', subGroup: 'Berat Besar', isFractionAllowed: true, decimalPlaces: 2, conversionBase: 'gr', conversionRate: 1000 },
            { name: 'Kwintal', symbol: 'kw', subGroup: 'Berat Besar', isFractionAllowed: true, decimalPlaces: 2, conversionBase: 'gr', conversionRate: 100000 },
            { name: 'Ton', symbol: 'ton', subGroup: 'Berat Besar', isFractionAllowed: true, decimalPlaces: 2, conversionBase: 'gr', conversionRate: 1000000 },
        ]
    },
    {
        group: 'VOLUME',
        units: [
            { name: 'Mililiter', symbol: 'ml', subGroup: 'Volume Cair', isFractionAllowed: true, decimalPlaces: 0, conversionBase: 'ml', conversionRate: 1 },
            { name: 'CC', symbol: 'cc', subGroup: 'Volume Cair', isFractionAllowed: true, decimalPlaces: 0, conversionBase: 'ml', conversionRate: 1 },
            { name: 'Liter', symbol: 'L', subGroup: 'Volume Cair', isFractionAllowed: true, decimalPlaces: 2, conversionBase: 'ml', conversionRate: 1000 },
        ]
    },
    {
        group: 'KEMASAN',
        units: [
            { name: 'Pack', symbol: 'pack', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Bungkus', symbol: 'bks', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Pouch', symbol: 'pouch', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Sachet', symbol: 'sct', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Tube', symbol: 'tube', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Porsi', symbol: 'porsi', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Box', symbol: 'box', subGroup: 'Kemasan Bulk', isFractionAllowed: false },
            { name: 'Dus', symbol: 'dus', subGroup: 'Kemasan Bulk', isFractionAllowed: false },
            { name: 'Kaleng', symbol: 'kaleng', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Botol', symbol: 'botol', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Cup', symbol: 'cup', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Gelas', symbol: 'gelas', subGroup: 'Kemasan Retail', isFractionAllowed: false },
            { name: 'Jerigen', symbol: 'jerigen', subGroup: 'Kemasan Bulk', isFractionAllowed: false },
        ]
    },
    {
        group: 'HITUNG',
        units: [
            { name: 'Buah', symbol: 'pcs', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Butir', symbol: 'butir', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Biji', symbol: 'biji', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Ikat', symbol: 'ikat', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Lembar', symbol: 'lbr', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Pasang', symbol: 'psg', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Tusuk', symbol: 'tusuk', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Mangkok', symbol: 'mangkok', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Piring', symbol: 'piring', subGroup: 'Satuan Unit', isFractionAllowed: false },
        ]
    },
    {
        group: 'KHUSUS',
        units: [
            { name: 'Kotak', symbol: 'kotak', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Loyang', symbol: 'loyang', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Toples', symbol: 'toples', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Sloki', symbol: 'sloki', subGroup: 'Satuan Unit', isFractionAllowed: true, decimalPlaces: 1 },
        ]
    },
    {
        group: 'GROSIR',
        units: [
            { name: 'Karton', symbol: 'ktn', subGroup: 'Kemasan Grosir', isFractionAllowed: false },
            { name: 'Ball', symbol: 'ball', subGroup: 'Kemasan Grosir', isFractionAllowed: false },
            { name: 'Kodi', symbol: 'kodi', subGroup: 'Kemasan Grosir', isFractionAllowed: false, conversionBase: 'pcs', conversionRate: 20 },
            { name: 'Lusin', symbol: 'lsn', subGroup: 'Kemasan Grosir', isFractionAllowed: false, conversionBase: 'pcs', conversionRate: 12 },
            { name: 'Gross', symbol: 'grs', subGroup: 'Kemasan Grosir', isFractionAllowed: false, conversionBase: 'pcs', conversionRate: 144 },
        ]
    },
    {
        group: 'FROZEN',
        units: [
            { name: 'Potong', symbol: 'ptg', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Ekor', symbol: 'ekor', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Slice', symbol: 'slc', subGroup: 'Satuan Unit', isFractionAllowed: false },
        ]
    },
    {
        group: 'BAHAN BAKU',
        units: [
            { name: 'Ruas', symbol: 'ruas', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Siung', symbol: 'siung', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Bonggol', symbol: 'bonggol', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Tangkai', symbol: 'tgk', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Batang', symbol: 'btng', subGroup: 'Satuan Unit', isFractionAllowed: false },
            { name: 'Genggam', symbol: 'ggm', subGroup: 'Satuan Unit', isFractionAllowed: false },
        ]
    }
];

async function main() {
  console.log('Seeding master database...')

  // --- Units ---
  console.log('Seeding Units...')
  for (const groupObj of unitGroups) {
      for (const unit of groupObj.units) {
          await prisma.unit.upsert({
              where: { name: unit.name },
              update: {
                  symbol: unit.symbol,
                  group: groupObj.group,
                  subGroup: unit.subGroup,
                  isFractionAllowed: unit.isFractionAllowed || false,
                  decimalPlaces: unit.decimalPlaces || 0,
                  conversionBase: unit.conversionBase || null,
                  conversionRate: unit.conversionRate || null,
              },
              create: {
                  name: unit.name,
                  symbol: unit.symbol,
                  group: groupObj.group,
                  subGroup: unit.subGroup,
                  isFractionAllowed: unit.isFractionAllowed || false,
                  decimalPlaces: unit.decimalPlaces || 0,
                  conversionBase: unit.conversionBase || null,
                  conversionRate: unit.conversionRate || null,
              }
          });
      }
  }

  console.log('✅ Units seeded.')
  console.log('ℹ️  Run seed_categories.js and seed_tags.js for full taxonomy setup.')
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
