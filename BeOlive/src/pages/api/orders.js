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
    const { id } = req.query;
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id: Number(id) },
        include: { items: true }
      });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (auth.user.role !== 'admin' && order.email !== auth.user.email) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      return res.status(200).json({ order });
    }

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