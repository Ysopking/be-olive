import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth.js';

const prisma = new PrismaClient();

async function seed() {
  try {
    // Seed Admin
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@beolive.com' } });
    if (!adminExists) {
      const hashed = await hashPassword('admin123');
      await prisma.user.create({
        data: {
          email: 'admin@beolive.com',
          passwordHash: hashed,
          role: 'admin',
        },
      });
      console.log('Admin seeded');
    }

    // Seed Customers
    const customers = [
      { email: 'kunde1@example.com', password: 'pass123' },
      { email: 'kunde2@example.com', password: 'pass123' },
    ];
    for (const c of customers) {
      const exists = await prisma.user.findUnique({ where: { email: c.email } });
      if (!exists) {
        const hashed = await hashPassword(c.password);
        await prisma.user.create({
          data: {
            email: c.email,
            passwordHash: hashed,
            role: 'customer',
          },
        });
        console.log(`Customer ${c.email} seeded`);
      }
    }

    // Seed Products
    const products = [
      { title: 'Olivewood Cutting Board Small', description: 'Klein, handgefertigt aus Olivenholz.', priceCents: 2490, stock: 20, image: 'https://example.com/board-small.jpg', sku: 'OWCB-S', slug: 'olivewood-cutting-board-small' },
      { title: 'Olivewood Spoon Set', description: 'Set von 3 Löffeln.', priceCents: 3990, stock: 15, image: 'https://example.com/spoon-set.jpg', sku: 'OWSS-3', slug: 'olivewood-spoon-set' },
      { title: 'Olivewood Salad Bowl', description: 'Große Salatschüssel.', priceCents: 5990, stock: 10, image: 'https://example.com/bowl.jpg', sku: 'OWSB-L', slug: 'olivewood-salad-bowl' },
    ];
    for (const p of products) {
      const exists = await prisma.product.findFirst({ where: { title: p.title } });
      if (!exists) {
        await prisma.product.create({ data: p });
        console.log(`Product ${p.title} seeded`);
      }
    }

    console.log('Seeding complete');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();