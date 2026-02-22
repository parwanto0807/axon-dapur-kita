import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.tag.findMany()
    .then(r => { console.log('✅ Tags table OK, count:', r.length); p.$disconnect(); })
    .catch(e => { console.error('❌ Tags table ERROR:', e.message); p.$disconnect(); });
