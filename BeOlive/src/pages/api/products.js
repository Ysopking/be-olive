import prisma from '../../lib/prisma'

export default async function handler(req, res) {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { gt: 0 } }, // Nur verfügbare Produkte
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('products API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}
