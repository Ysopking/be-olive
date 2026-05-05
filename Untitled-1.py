#!/usr/bin/env python3
# create_beolive.py
# Erstellt das BeOlive-Projekt mit allen Dateien und Inhalten (MVP scaffold).
import os
from pathlib import Path
from textwrap import dedent

ROOT = Path.cwd() / "BeOlive"

FILES = {
    "package.json": dedent("""\
    {
      "name": "beolive",
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "prisma": "prisma"
      },
      "dependencies": {
        "next": "13.4.7",
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "tailwindcss": "^3.4.0",
        "autoprefixer": "^10.4.0",
        "postcss": "^8.4.0",
        "@prisma/client": "^4.10.0",
        "stripe": "^12.0.0",
        "@paypal/checkout-server-sdk": "^2.0.0",
        "dotenv": "^16.0.0",
        "swr": "^2.1.0"
      },
      "devDependencies": {
        "prisma": "^4.10.0"
      }
    }
    """),
    "README.md": "# BeOlive — Starterprojekt\n\nNext.js + Tailwind + Prisma + Stripe + PayPal\n\nÖffne den Workspace: `code BeOlive/BeOlive.code-workspace`\n",
    ".env.example": dedent("""\
    # Datenbank
    DATABASE_URL=postgresql://user:password@localhost:5432/beolive

    # Site
    NEXT_PUBLIC_SITE_URL=http://localhost:3000

    # Stripe
    STRIPE_SECRET_KEY=sk_test_xxx
    STRIPE_WEBHOOK_SECRET=whsec_xxx

    # PayPal
    PAYPAL_CLIENT_ID=sb_xxx
    PAYPAL_CLIENT_SECRET=xxx

    # Admin
    ADMIN_PASSWORD=changeme
    """),
    ".gitignore": dedent("""\
    node_modules/
    .env
    .DS_Store
    .next/
    """),
    "next.config.js": dedent("""\
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      reactStrictMode: true,
      i18n: {
        locales: ['de','en'],
        defaultLocale: 'de'
      }
    }
    module.exports = nextConfig
    """),
    "tailwind.config.js": dedent("""\
    module.exports = {
      content: ["./src/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
      theme: { extend: {} },
      plugins: [],
    }
    """),
    "postcss.config.js": dedent("""\
    module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    }
    """),
    "prisma/schema.prisma": dedent("""\
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model Product {
      id          Int     @id @default(autoincrement())
      title       String
      slug        String  @unique
      description String?
      priceCents  Int
      currency    String  @default("EUR")
      image       String?
      sku         String?
      stock       Int     @default(0)
      weightGram  Int?
      createdAt   DateTime @default(now())
    }

    model Order {
      id               Int       @id @default(autoincrement())
      orderNumber      String    @unique
      email            String?
      shippingAddress  Json?
      totalCents       Int
      shippingCents    Int
      taxCents         Int
      currency         String    @default("EUR")
      status           String    @default("pending")
      paid             Boolean   @default(false)
      returned         Boolean   @default(false)
      createdAt        DateTime  @default(now())
      items            OrderItem[]
    }

    model OrderItem {
      id         Int    @id @default(autoincrement())
      order      Order  @relation(fields: [orderId], references: [id])
      orderId    Int
      productId  Int?
      title      String
      priceCents Int
      quantity   Int
    }

    model AccountingEntry {
      id          Int      @id @default(autoincrement())
      orderId     Int?
      amountCents Int
      type        String
      description String?
      createdAt   DateTime @default(now())
    }

    model ProductAnalysis {
      id         Int      @id @default(autoincrement())
      productId  Int      @unique
      totalSold  Int      @default(0)
      lastSoldAt DateTime?
    }
    """),
    "prisma/README_MIGRATE.md": dedent("""\
    Prisma Migration instructions

    After you set DATABASE_URL in your `.env`, run:

    npx prisma migrate dev --name init
    npx prisma generate
    """),
    "src/lib/prisma.js": dedent("""\
    import { PrismaClient } from '@prisma/client'
    const globalForPrisma = globalThis
    const prisma = globalForPrisma.prisma || new PrismaClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
    export default prisma
    """),
    "src/lib/stripe.js": dedent("""\
    import Stripe from 'stripe'
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-08-01' })
    export default stripe
    """),
    "src/lib/accounting.js": dedent("""\
    import prisma from './prisma'
    export async function createAccountingEntry({ orderId, amountCents, type, description }) {
      try {
        if (!prisma.accountingEntry) return null
        const entry = await prisma.accountingEntry.create({ data: { orderId: orderId ? Number(orderId) : null, amountCents: Number(amountCents||0), type: type || 'sale', description: description || '' } })
        return entry
      } catch (e) { console.warn('createAccountingEntry skipped', e.message); return null }
    }
    """),
    "src/context/cart.js": dedent("""\
    import { createContext, useEffect, useState } from 'react'
    export const CartContext = createContext({})
    export function CartProvider({ children }) {
      const [items, setItems] = useState([])
      useEffect(()=>{ try { const raw = localStorage.getItem('cart_v1'); if(raw) setItems(JSON.parse(raw)) } catch(e){} }, [])
      useEffect(()=>{ try{ localStorage.setItem('cart_v1', JSON.stringify(items)) }catch(e){} }, [items])
      function addItem(item) { setItems(curr=>{ const idx = curr.findIndex(i=>i.productId===item.productId); if(idx>=0){ const copy=[...curr]; copy[idx].quantity += item.quantity||1; return copy } return [...curr, {...item, quantity: item.quantity||1}] }) }
      function removeItem(productId){ setItems(curr=>curr.filter(i=>i.productId!==productId)) }
      function updateQuantity(productId, qty){ setItems(curr=>curr.map(i=> i.productId===productId ? {...i, quantity: qty} : i)) }
      function clear(){ setItems([]) }
      const totalCents = items.reduce((s,it)=> s + (it.priceCents||0)*(it.quantity||1), 0)
      return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, totalCents }}>{children}</CartContext.Provider>
    }
    """),
    "src/pages/_app.js": dedent("""\
    import '../styles/globals.css'
    import { CartProvider } from '../context/cart'
    export default function App({ Component, pageProps }) {
      return <CartProvider><Component {...pageProps} /></CartProvider>
    }
    """),
    "src/pages/index.js": dedent("""\
    import Link from 'next/link'
    import useSWR from 'swr'
    const fetcher = (url) => fetch(url).then(r => r.json())
    export default function Home() {
      const { data: products } = useSWR('/api/products', fetcher, { refreshInterval: 0 })
      return (
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Olivewood — Handgefertigte Produkte</h1>
          <div>
            {products?.map(p => (
              <article key={p.id} className="border rounded p-4 mb-4">
                <h2 className="text-xl font-semibold"><Link href={`/product/${p.id}`}>{p.title}</Link></h2>
                <p className="mt-2">{p.description}</p>
                <div className="mt-4 font-bold">{(p.priceCents/100).toFixed(2)} {p.currency}</div>
              </article>
            ))}
          </div>
        </div>
      )
    }
    """),
    "src/pages/product/[id].js": dedent("""\
    import { useContext } from 'react'
    import { CartContext } from '../../context/cart'
    export default function ProductPage({ product }) {
      const { addItem } = useContext(CartContext)
      function addToCart(){ addItem({ productId: product.id, title: product.title, priceCents: product.priceCents, currency: product.currency||'EUR', quantity: 1 }); alert('Produkt zum Warenkorb hinzugefügt') }
      return (
        <div className="container">
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <p className="mt-4">{product.description}</p>
          <div className="mt-6 font-bold">{(product.priceCents/100).toFixed(2)} {product.currency || 'EUR'}</div>
          <div className="mt-6 flex gap-3">
            <button onClick={addToCart} className="px-4 py-2 bg-gray-800 text-white rounded">In Warenkorb</button>
          </div>
        </div>
      )
    }
    ProductPage.getInitialProps = async ({ query }) => {
      const id = Number(query.id || 1)
      return { product: { id, title: 'Olivewood Item', description: 'Wunderschön verarbeitetes Olivenholz.', priceCents: 4990, currency: 'EUR' } }
    }
    """),
    "src/pages/cart.js": dedent("""\
    import { useContext } from 'react'
    import { CartContext } from '../context/cart'
    export default function CartPage() {
      const { items, removeItem, updateQuantity, totalCents, clear } = useContext(CartContext)
      async function checkoutStripe() {
        const res = await fetch('/api/checkout/stripe', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items, acceptedTerms: true }) })
        if (res.redirected) window.location.href = res.url
        else alert('Fehler beim Checkout')
      }
      async function checkoutPayPal() {
        const res = await fetch('/api/checkout/paypal', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items, acceptedTerms: true }) })
        if (res.redirected) window.location.href = res.url
        else alert('Fehler beim Checkout')
      }
      return (
        <div className="container">
          <h1 className="text-2xl font-bold mb-4">Warenkorb</h1>
          {items.length===0 ? <p>Dein Warenkorb ist leer.</p> : (
            <div>
              <ul>
                {items.map(it => (
                  <li key={it.productId} className="flex justify-between items-center border-b py-3">
                    <div>
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-sm text-gray-600">{(it.priceCents/100).toFixed(2)} {it.currency||'EUR'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" value={it.quantity} onChange={(e)=> updateQuantity(it.productId, Number(e.target.value))} className="w-16 border p-1" />
                      <button onClick={()=> removeItem(it.productId)} className="text-red-600">Entfernen</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 font-bold">Zwischensumme: {(totalCents/100).toFixed(2)} EUR</div>
              <div className="mt-2">Versand: 4.90 EUR</div>
              <div className="mt-2 text-xl font-bold">Gesamt: {((totalCents+490)/100).toFixed(2)} EUR</div>
              <div className="mt-4 flex gap-3">
                <button onClick={checkoutStripe} className="px-4 py-2 bg-green-600 text-white rounded">Bezahle mit Stripe</button>
                <button onClick={checkoutPayPal} className="px-4 py-2 bg-blue-600 text-white rounded">Bezahle mit PayPal</button>
                <button onClick={clear} className="px-4 py-2 bg-gray-300">Leeren</button>
              </div>
            </div>
          )}
        </div>
      )
    }
    """),
    "src/pages/api/products.js": dedent("""\
    export default function handler(req, res) {
      res.json([
        { id: 1, title: 'Olivewood Board Small', description: 'Kleine Schneidbrett aus Olivenholz', priceCents: 2490, currency: 'EUR' },
        { id: 2, title: 'Olivewood Spoon', description: 'Handgefertigter Löffel', priceCents: 1990, currency: 'EUR' }
      ])
    }
    """),
    "src/pages/api/checkout/stripe.js": dedent("""\
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
    """),
    "src/pages/api/checkout/paypal.js": dedent("""\
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
    """),
    "src/pages/api/webhooks/stripe.js": dedent("""\
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
            await prisma.order.update({ where:{ id: orderId }, data:{ paid: true, status:'paid' } })
            for(const it of items){ try{ if(it.productId) await prisma.product.updateMany({ where:{ id: it.productId }, data: { stock: { decrement: it.quantity } } }) }catch(e){console.warn('stock update failed', e.message)} }
            const total = Number(session.amount_total || items.reduce((s,i)=> s + (i.priceCents||0)*(i.quantity||1),0))
            await createAccountingEntry({ orderId, amountCents: total, type: 'sale', description: `Sale via Stripe ${session.id}` })
            for(const it of items){ try{ if(!it.productId) continue; await prisma.productAnalysis.upsert({ where: { productId: it.productId }, update: { totalSold: { increment: it.quantity } }, create: { productId: it.productId, totalSold: it.quantity, lastSoldAt: new Date() } }) }catch(e){console.warn('analysis failed', e.message)} }
          }
        }catch(e){ console.error('Error processing webhook', e); return res.status(500).send('internal error') }
      }
      res.json({ received: true })
    }
    """),
    "src/pages/api/admin/products.js": dedent("""\
    import prisma from '../../../lib/prisma'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'
    function checkAuth(req){ const header = req.headers['x-admin-password'] || ''; return header === ADMIN_PASSWORD }
    export default async function handler(req,res){
      if(!checkAuth(req)) return res.status(401).json({ error:'unauthorized' })
      try{
        if(req.method === 'GET'){ const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }); return res.json(products) }
        if(req.method === 'POST'){ const { title, slug, description, priceCents, currency, image, sku, stock, weightGram } = req.body; const prod = await prisma.product.create({ data: { title, slug, description, priceCents: Number(priceCents||0), currency: currency||'EUR', image: image||null, sku: sku||null, stock: Number(stock||0), weightGram: weightGram?Number(weightGram):null } }); return res.status(201).json(prod) }
        if(req.method === 'PUT'){ const { id, ...data } = req.body; if(!id) return res.status(400).json({ error:'id_required' }); const prod = await prisma.product.update({ where: { id: Number(id) }, data: { ...data, priceCents: data.priceCents ? Number(data.priceCents) : undefined, stock: data.stock ? Number(data.stock) : undefined } }); return res.json(prod) }
        if(req.method === 'DELETE'){ const { id } = req.query; await prisma.product.delete({ where: { id: Number(id) } }); return res.json({ ok:true }) }
        res.status(405).end()
      }catch(err){ console.error('admin/products error', err); res.status(500).json({ error:'server_error' }) }
    }
    """),
    "src/pages/admin/products.js": dedent("""\
    import { useEffect, useState } from 'react'
    export default function AdminProducts(){
      const [pwd,setPwd]=useState(''); const [auth,setAuth]=useState(false); const [products,setProducts]=useState([]); const [form,setForm]=useState({ title:'', slug:'', description:'', price:'', stock:0, image:'', sku:''})
      useEffect(()=>{ if(auth) load() },[auth])
      async function load(){ const res = await fetch('/api/admin/products',{ headers: { 'x-admin-password': pwd } }); if(res.status===200) setProducts(await res.json()); else alert('Auth fehlgeschlagen') }
      function login(e){ e.preventDefault(); setAuth(true) }
      async function createProduct(e){ e.preventDefault(); const body = { title: form.title, slug: form.slug || form.title.toLowerCase().replace(/\\s+/g,'-'), description: form.description, priceCents: Math.round(parseFloat(form.price||0)*100), currency: 'EUR', image: form.image, sku: form.sku, stock: Number(form.stock||0) }; const res = await fetch('/api/admin/products',{ method:'POST', headers:{ 'Content-Type':'application/json','x-admin-password':pwd }, body: JSON.stringify(body) }); if(res.status===201){ setForm({ title:'', slug:'', description:'', price:'', stock:0, image:'', sku:'' }); load() } else alert('Fehler beim Erstellen') }
      async function del(id){ if(!confirm('Produkt löschen?')) return; await fetch('/api/admin/products?id='+id,{ method:'DELETE', headers:{ 'x-admin-password': pwd } }); load() }
      return (
        <div className="container">
          {!auth && (<form onSubmit={login} className="max-w-md"><h2 className="text-xl font-bold mb-2">Admin Login</h2><input type="password" className="border p-2 w-full" placeholder="Admin Passwort" value={pwd} onChange={e=>setPwd(e.target.value)} /><button className="mt-2 px-3 py-2 bg-gray-800 text-white rounded">Login</button></form>)}
          {auth && (<div><h1 className="text-2xl font-bold mb-4">Produkte verwalten</h1><form onSubmit={createProduct} className="mb-6 border p-4"><input className="w-full border p-2 mb-2" placeholder="Titel" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} /><input className="w-full border p-2 mb-2" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug: e.target.value})} /><input className="w-full border p-2 mb-2" placeholder="Bild URL" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} /><input className="w-full border p-2 mb-2" placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} /><input className="w-full border p-2 mb-2" placeholder="Preis (EUR)" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} /><input className="w-full border p-2 mb-2" placeholder="Bestand" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} /><textarea className="w-full border p-2 mb-2" placeholder="Beschreibung" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} /><button className="px-3 py-2 bg-green-600 text-white rounded">Produkt erstellen</button></form><div><h2 className="text-xl font-semibold mb-2">Produkte</h2>{products.map(p => (<div key={p.id} className="border p-3 mb-2 flex justify-between items-center"><div><div className="font-semibold">{p.title} ({p.sku||'-'})</div><div className="text-sm">{(p.priceCents/100).toFixed(2)} {p.currency} — Bestand: {p.stock}</div></div><div className="flex gap-2"><a className="px-2 py-1 bg-blue-600 text-white rounded" href={`/product/${p.id}`} target="_blank">ansicht</a><button onClick={()=>del(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">löschen</button></div></div>))}</div></div>)}
        </div>
      )
    }
    """),
    "src/pages/api/admin/orders.js": dedent("""\
    import prisma from '../../../lib/prisma'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'
    function checkAuth(req){ return (req.headers['x-admin-password'] || '') === ADMIN_PASSWORD }
    export default async function handler(req,res){
      if(!checkAuth(req)) return res.status(401).json({ error:'unauthorized' })
      try{
        if(req.method==='GET'){ const { id, status } = req.query; if(id){ const order = await prisma.order.findUnique({ where:{ id: Number(id) }, include: { items: true } }); return res.json(order) } const where = {}; if(status) where.status = status; const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, include: { items: true } }); return res.json(orders) }
        if(req.method==='PUT'){ const { id, status, trackingNumber, note, markReturned } = req.body; if(!id) return res.status(400).json({ error:'id_required' }); const data = {}; if(status) data.status = status; if(trackingNumber) data.shippingTracking = trackingNumber; if(markReturned !== undefined) data.returned = !!markReturned; if(note) data.adminNote = note; const updated = await prisma.order.update({ where:{ id: Number(id) }, data }); return res.json(updated) }
        res.status(405).end()
      }catch(err){ console.error('admin/orders error', err); res.status(500).json({ error:'server_error' }) }
    }
    """),
    "src/styles/globals.css": dedent("""\
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    body{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial}
    .container{max-width:960px;margin:0 auto;padding:24px}
    """),
    "src/locales/de.json": dedent('''\
    {
      "title": "Olivewood — Handgefertigte Produkte",
      "cart": "Warenkorb",
      "checkout": "Zur Kasse"
    }
    '''),
    "src/locales/en.json": dedent('''\
    {
      "title": "Olivewood — Handcrafted Products",
      "cart": "Cart",
      "checkout": "Checkout"
    }
    '''),
    "BeOlive.code-workspace": dedent("""\
    {
      "folders": [{ "path": "." }],
      "settings": {
        "files.exclude": { "**/node_modules": true, "**/.env": true, "**/.DS_Store": true }
      }
    }
    """),
    "src/BeOlive/BeOlive.code-workspace": dedent("""\
    {
      "folders": [{ "path": "." }],
      "settings": {
        "files.exclude": {
          "**/node_modules": true,
          "**/.env": true,
          "**/.DS_Store": true
        }
      }
    }
    """),
    "src/BeOlive/.vscode/settings.json": dedent("""\
    {
      "editor.formatOnSave": true,
      "editor.tabSize": 2,
      "files.exclude": { "**/.env": true, "**/node_modules": true }
    }
    """),
    "src/BeOlive/.gitignore": ".env\nnode_modules/\n.DS_Store\n",
    "src/BeOlive/.env": dedent("""\
    # Lokale Secrets für das BeOlive-Repo (PLATZHALTER)
    SECRET_KEY=replace_this_with_a_strong_secret
    ADMIN_PASSWORD=change_this_admin_pwd
    # STRIPE_SECRET_KEY=
    # PAYPAL_CLIENT_ID=
    # DATABASE_URL=
    """),
    "src/BeOlive/scripts/setup_local.sh": dedent("""\
    #!/usr/bin/env bash
    echo "Dieses Script wurde vom Bootstrap erstellt. Du kannst es manuell anpassen."
    """),
}

# Directories to ensure exist
DIRS = [
    "prisma",
    "src",
    "src/lib",
    "src/context",
    "src/pages",
    "src/pages/api",
    "src/pages/api/checkout",
    "src/pages/api/webhooks",
    "src/pages/admin",
    "src/pages/product",
    "src/styles",
    "src/locales",
    "src/BeOlive",
    "src/BeOlive/.vscode",
    "src/BeOlive/scripts",
]

def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    # Backup existing file
    if path.exists():
        backup = path.with_suffix(path.suffix + ".bak")
        path.replace(backup)
        print(f"Backup existing {path} -> {backup}")
    path.write_text(content, encoding="utf-8")
    # make shell scripts executable
    if path.suffix in ('.sh',) or path.name in ('beolive_bootstrap.sh',):
        try:
            path.chmod(0o755)
        except Exception:
            pass

def main():
    print(f"Erstelle BeOlive Projekt in: {ROOT}")
    for d in DIRS:
        (ROOT / d).mkdir(parents=True, exist_ok=True)
    for rel, content in FILES.items():
        target = ROOT / rel
        write_file(target, content)
        print(f"-> geschrieben: {target.relative_to(Path.cwd())}")
    print("\nFertig. Nächste Schritte (lokal ausführen):")
    print("  cd BeOlive")
    print("  npm install")
    print("  cp .env.example .env  # und .env anpassen (DATABASE_URL, STRIPE keys ...)")
    print("  npx prisma generate")
    print("  npm run dev")
    print("\nÖffne Workspace in VS Code: code BeOlive/BeOlive.code-workspace")

if __name__ == '__main__':
    main()