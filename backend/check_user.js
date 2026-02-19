const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { shop: true }
    });
    console.log('USER STATUS:', JSON.stringify(user, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

// You can pass the email as an argument
const email = process.argv[2] || 'parwa@example.com'; // Default or from user info if known
checkUser(email);
