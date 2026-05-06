import prisma from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const auth = requireAuth(req)
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  try {
    const { id } = req.query
    const order = await prisma.order.findUnique({ where: { id: Number(id) }, include: { items: true } })
    if (!order) return res.status(404).json({ error: 'order_not_found' })
    if (auth.user.role !== 'admin' && order.email !== auth.user.email) {
      return res.status(403).json({ error: 'forbidden' })
    }
    return res.status(200).json({ invoice: {
      invoiceNumber: order.invoiceNumber,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      billedTo: order.email,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      totalCents: order.totalCents,
      shippingCents: order.shippingCents,
      taxCents: order.taxCents,
      currency: order.currency,
      items: order.items.map(item => ({ title: item.title, quantity: item.quantity, unitPrice: item.priceCents, total: item.priceCents * item.quantity }))
    } })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'server_error' })
  }
}
