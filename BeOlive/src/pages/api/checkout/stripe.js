import Stripe from 'stripe'
import prisma from '../../../lib/prisma'
import { createAuditLog } from '../../../lib/audit'
import { createAccountingEntry } from '../../../lib/accounting'
import { validateOrder, sanitizeString } from '../../../lib/validation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-08-01' })
function generateOrderNumber(){ return 'OW-' + Date.now().toString(36).toUpperCase() }
function generateInvoiceNumber(){ const now = new Date(); return `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Date.now().toString(36).toUpperCase()}` }

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  const body = req.body
  const items = body.items || []
  const acceptedTerms = body.acceptedTerms
  const customer = body.customer || {}
  const shippingAddress = sanitizeString(customer.address || '') || null
  const email = sanitizeString(customer.email || '') || null

  if (!acceptedTerms) return res.status(400).json({ error: 'terms_not_accepted' })
  const orderValidation = validateOrder({ email, shippingAddress, items })
  if (orderValidation.length > 0) return res.status(400).json({ error: 'invalid_order', details: orderValidation })

  // Validate prices against DB
  for (const it of items) {
    if (!it.productId) continue;
    const product = await prisma.product.findUnique({ where: { id: it.productId } });
    if (!product) return res.status(400).json({ error: 'product_not_found', productId: it.productId });
    if (product.priceCents !== it.priceCents) return res.status(400).json({ error: 'price_mismatch', productId: it.productId });
    if (product.stock < it.quantity) return res.status(400).json({ error: 'insufficient_stock', productId: it.productId });
  }

  const itemsTotal = items.reduce((s,it)=> s + (it.priceCents||0)*(it.quantity||1), 0)
  const shipping = 490
  const taxCents = Math.round(itemsTotal * 0.19)
  const totalCents = itemsTotal + shipping + taxCents

  try{
    const invoiceNumber = generateInvoiceNumber()
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        invoiceNumber,
        email,
        shippingAddress,
        billingAddress: shippingAddress,
        totalCents,
        shippingCents: shipping,
        taxCents,
        currency: 'EUR',
        status: 'pending',
        paid: false,
        paymentProvider: 'stripe',
        items: { create: items.map(it=>({ productId: it.productId || 0, title: sanitizeString(it.title), priceCents: it.priceCents || 0, quantity: it.quantity || 1 })) }
      }
    })

    if (process.env.NODE_ENV === 'development') {
      await prisma.order.update({ where: { id: order.id }, data: { paid: true, status: 'paid' } });
      for (const it of items) {
        if (it.productId) {
          await prisma.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
        }
      }
      await createAccountingEntry({ orderId: order.id, amountCents: totalCents, type: 'sale', description: `Mock Sale ${order.orderNumber}` });
      await createAuditLog({ entity: 'order', entityId: order.id, action: 'mock_payment_completed', userId: null, details: `Stripe mock payment complete for order ${order.orderNumber}` })
      res.status(200).json({ success: true, orderId: order.id, invoiceNumber, message: 'Mock payment successful' });
      return
    }

    const line_items = items.map(it=>({ price_data: { currency: (it.currency||'EUR').toLowerCase(), product_data: { name: it.title }, unit_amount: it.priceCents }, quantity: it.quantity||1 }))
    line_items.push({ price_data: { currency: 'eur', product_data: { name: 'Versand' }, unit_amount: shipping }, quantity: 1 })
    line_items.push({ price_data: { currency: 'eur', product_data: { name: 'Steuern' }, unit_amount: taxCents }, quantity: 1 })
    const session = await stripe.checkout.sessions.create({
      payment_method_types:['card'],
      mode:'payment',
      line_items,
      metadata:{ orderId: String(order.id), invoiceNumber },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/checkout?success=1&orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/checkout?canceled=1&orderId=${order.id}`
    })
    await prisma.order.update({ where:{ id: order.id }, data:{ paymentProviderId: session.id } })
    await createAuditLog({ entity: 'order', entityId: order.id, action: 'checkout_started', userId: null, details: `Stripe checkout session created ${session.id}` })
    res.status(200).json({ checkoutUrl: session.url, orderId: order.id, invoiceNumber })
  }catch(e){
    console.error(e)
    res.status(500).json({ error: 'checkout_failed' })
  }
}
