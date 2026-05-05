import Stripe from 'stripe'
import prisma from '../../../lib/prisma'
import { createAccountingEntry } from '../../../lib/accounting'
export const config = { api: { bodyParser: false } }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-08-01' })
async function getRawBody(req){ const chunks=[]; for await (const c of req) chunks.push(typeof c==='string' ? Buffer.from(c) : c); return Buffer.concat(chunks) }
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  const buf = await getRawBody(req); const sig = req.headers['stripe-signature']
  let event
  try { event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret) } catch (err) { console.error('Webhook signature failed', err.message); return res.status(400).send(`Webhook Error: ${err.message}`) }
  if(event.type === 'checkout.session.completed'){ const session = event.data.object
    try{
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 })
      const items = (lineItems.data||[]).map(li=>({ productId: Number(li.price?.product)||null, title: li.description || 'Item', priceCents: Number(li.price?.unit_amount|| li.amount_subtotal||0), quantity: Number(li.quantity||1) }))
      const orderId = session.metadata?.orderId ? Number(session.metadata.orderId) : null
      if(orderId){
        await prisma.$transaction(async (tx) => {
          await tx.order.update({ where:{ id: orderId }, data:{ paid: true, status:'paid' } })
          for(const it of items){
            if(it.productId) {
              const updatedProduct = await tx.product.update({
                where: { id: it.productId },
                data: { stock: { decrement: it.quantity } },
                select: { stock: true, title: true }
              })
              // Automatischer Alert bei Low Stock
              if (updatedProduct.stock <= 5) {
                await tx.alert.create({
                  data: {
                    type: 'low_stock',
                    message: `Produkt "${updatedProduct.title}" hat nur noch ${updatedProduct.stock} Stück auf Lager.`,
                    productId: it.productId
                  }
                })
              }
            }
          }
          const total = Number(session.amount_total || items.reduce((s,i)=> s + (i.priceCents||0)*(i.quantity||1),0))
          await createAccountingEntry({ orderId, amountCents: total, type: 'sale', description: `Sale via Stripe ${session.id}` })
          for(const it of items){
            if(it.productId) {
              await tx.productAnalysis.upsert({
                where: { productId: it.productId },
                update: { totalSold: { increment: it.quantity }, lastSoldAt: new Date() },
                create: { productId: it.productId, totalSold: it.quantity, lastSoldAt: new Date() }
              })
            }
          }
        })
      }
    }catch(e){ console.error('Error processing webhook', e); return res.status(500).send('internal error') }
  }
  res.json({ received: true })
}
