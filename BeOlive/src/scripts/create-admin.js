import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth.js';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2] || 'admin@beolive.com';
  const password = process.argv[3] || 'admin123';
  const role = 'admin';

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin already exists');
      return;
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        role,
      },
    });
    console.log('Admin user created:', user.email);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();