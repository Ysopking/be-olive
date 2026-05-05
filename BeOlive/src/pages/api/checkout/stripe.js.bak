import Stripe from 'stripe'
import prisma from '../../../lib/prisma'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-08-01' })
function generateOrderNumber(){ return 'OW-' + Date.now().toString(36).toUpperCase() }
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  const body = req.body
  const items = body.items || []
  const acceptedTerms = body.acceptedTerms
  if (!acceptedTerms) return res.status(400).json({ error: 'terms_not_accepted' })
  const itemsTotal = items.reduce((s,it)=> s + (it.priceCents||0)*(it.quantity||1), 0)
  const shipping = 490
  const totalCents = itemsTotal + shipping
  try{
    const order = await prisma.order.create({ data: { orderNumber: generateOrderNumber(), email: body.customer?.email || null, shippingAddress: body.customer?.address || null, totalCents, shippingCents: shipping, taxCents: 0, currency: 'EUR', status: 'pending', paid: false, items: { create: items.map(it=>({ productId: it.productId || 0, title: it.title, priceCents: it.priceCents || 0, quantity: it.quantity || 1 })) } } })
    const line_items = items.map(it=>({ price_data: { currency: (it.currency||'EUR').toLowerCase(), product_data: { name: it.title }, unit_amount: it.priceCents }, quantity: it.quantity||1 }))
    line_items.push({ price_data: { currency: 'eur', product_data: { name: 'Versand' }, unit_amount: shipping }, quantity: 1 })
    const session = await stripe.checkout.sessions.create({ payment_method_types:['card'], mode:'payment', line_items, metadata:{ orderId: String(order.id) }, success_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/?success=1&orderId=${order.id}`, cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/?canceled=1&orderId=${order.id}` })
    res.status(303).setHeader('Location', session.url).end()
  }catch(e){ console.error(e); res.status(500).json({ error: 'checkout_failed' }) }
}
