import paypal from '@paypal/checkout-server-sdk'
import prisma from '../../../lib/prisma'
import { createAuditLog } from '../../../lib/audit'
import { validateOrder, sanitizeString } from '../../../lib/validation'

const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID || '', process.env.PAYPAL_CLIENT_SECRET || '')
const client = new paypal.core.PayPalHttpClient(environment)

function generateOrderNumber(){ return 'OW-' + Date.now().toString(36).toUpperCase() }
function generateInvoiceNumber(){ const now = new Date(); return `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Date.now().toString(36).toUpperCase()}` }

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  const items = req.body.items || []
  const customer = req.body.customer || {}
  const email = sanitizeString(customer.email || '') || null
  const shippingAddress = sanitizeString(customer.address || '') || null
  const acceptedTerms = req.body.acceptedTerms
  const orderValidation = validateOrder({ email, shippingAddress, items })
  if (!acceptedTerms) return res.status(400).json({ error: 'terms_not_accepted' })
  if (orderValidation.length > 0) return res.status(400).json({ error: 'invalid_order', details: orderValidation })

  const itemsTotalCents = items.reduce((s,it)=> s + (it.priceCents||0)*(it.quantity||1), 0)
  const shipping = 490
  const taxCents = Math.round(itemsTotalCents * 0.19)
  const totalCents = itemsTotalCents + shipping + taxCents
  const total = (totalCents/100).toFixed(2)

  try {
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        invoiceNumber: generateInvoiceNumber(),
        email,
        shippingAddress,
        billingAddress: shippingAddress,
        totalCents,
        shippingCents: shipping,
        taxCents,
        currency: 'EUR',
        status: 'pending',
        paid: false,
        paymentProvider: 'paypal',
        items: { create: items.map(it => ({ productId: it.productId || 0, title: sanitizeString(it.title), priceCents: it.priceCents || 0, quantity: it.quantity || 1 })) }
      }
    })

    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent:'CAPTURE',
      purchase_units:[{
        amount: { currency_code: 'EUR', value: total },
        description: `Olivewood order ${order.orderNumber}`
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/checkout?paypal_success=1&orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/checkout?paypal_cancel=1&orderId=${order.id}`
      }
    })

    const result = await client.execute(request)
    const approveUrl = result.result.links.find(l=>l.rel==='approve')?.href
    await prisma.order.update({ where: { id: order.id }, data: { paymentProviderId: result.result.id } })
    await createAuditLog({ entity: 'order', entityId: order.id, action: 'paypal_checkout_started', userId: null, details: `PayPal order ${result.result.id}` })
    if (!approveUrl) {
      return res.status(500).json({ error: 'paypal_approval_url_missing' })
    }
    res.status(200).json({ checkoutUrl: approveUrl, orderId: order.id, invoiceNumber: order.invoiceNumber })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error:'PayPal create order failed' })
  }
}
