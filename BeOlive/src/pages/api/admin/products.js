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
