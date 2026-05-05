import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try {
    const orders = await prisma.order.findMany({
      where: { email: auth.user.email },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}