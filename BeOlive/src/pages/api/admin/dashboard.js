import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const auth = requireAuth(req, ['admin', 'manager'])
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  try {
    // Zahlungseingänge: Bezahlte Orders
    const payments = await prisma.order.findMany({
      where: { paid: true },
      select: { id: true, orderNumber: true, totalCents: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Buchhaltung: Aggregierte Daten
    const accounting = await prisma.accountingEntry.aggregate({
      _sum: { amountCents: true },
      where: { type: 'sale' }
    })
    const pendingOrders = await prisma.order.count({ where: { paid: false } })

    // Warenwirtschaft: Produkte mit niedrigem Stock
    const inventory = await prisma.product.findMany({
      where: { stock: { lte: 10 } },
      select: { id: true, title: true, stock: true },
      orderBy: { stock: 'asc' },
      take: 10
    })

    // Alerts: Unresolved Alerts
    const alerts = await prisma.alert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json({
      payments,
      accounting: {
        totalRevenue: accounting._sum.amountCents || 0,
        pending: pendingOrders
      },
      inventory,
      alerts
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Server error' })
  }
}