import paypal from '@paypal/checkout-server-sdk'
const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID || '', process.env.PAYPAL_CLIENT_SECRET || '')
const client = new paypal.core.PayPalHttpClient(environment)
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).end()
  const items = req.body.items || []
  const itemsTotalCents = items.reduce((s,it)=> s + (it.priceCents||0)*(it.quantity||1), 0)
  const totalCents = itemsTotalCents + 490
  const total = (totalCents/100).toFixed(2)
  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer('return=representation')
  request.requestBody({ intent:'CAPTURE', purchase_units:[{ amount: { currency_code: 'EUR', value: total }, description: 'Olivewood order' }], application_context: { return_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/?paypal_success=1`, cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/?paypal_cancel=1` } })
  try { const order = await client.execute(request); const approveUrl = order.result.links.find(l=>l.rel==='approve')?.href; res.status(303).setHeader('Location', approveUrl).end() } catch(e){ console.error(e); res.status(500).json({ error:'PayPal create order failed' }) }
}
