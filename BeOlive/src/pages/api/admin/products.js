import prisma from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'
import { validateProduct, sanitizeString } from '../../../lib/validation'

export default async function handler(req,res){
  const auth = requireAuth(req, ['admin', 'manager']);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  try{
    if(req.method === 'GET'){ const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }); return res.json(products) }
    if(req.method === 'POST'){
      const { title, slug, description, priceCents, currency, image, sku, stock, weightGram } = req.body;
      const data = {
        title: sanitizeString(title),
        slug: sanitizeString(slug) || sanitizeString(title).toLowerCase().replace(/\s+/g,'-'),
        description: sanitizeString(description),
        priceCents: Number(priceCents||0),
        currency: currency||'EUR',
        image: sanitizeString(image)||null,
        sku: sanitizeString(sku)||null,
        stock: Number(stock||0),
        weightGram: weightGram?Number(weightGram):null
      };
      const errors = validateProduct(data);
      if (errors.length > 0) return res.status(400).json({ errors });
      const prod = await prisma.product.create({ data });
      return res.status(201).json(prod);
    }
    if(req.method === 'PUT'){
      const { id, ...body } = req.body;
      if(!id) return res.status(400).json({ error:'id_required' });
      const data = {
        title: body.title ? sanitizeString(body.title) : undefined,
        slug: body.slug ? sanitizeString(body.slug) : undefined,
        description: body.description ? sanitizeString(body.description) : undefined,
        priceCents: body.priceCents !== undefined ? Number(body.priceCents) : undefined,
        currency: body.currency || undefined,
        image: body.image ? sanitizeString(body.image) : undefined,
        sku: body.sku ? sanitizeString(body.sku) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        weightGram: body.weightGram !== undefined ? Number(body.weightGram) : undefined
      };
      const errors = validateProduct(data);
      if (errors.length > 0) return res.status(400).json({ errors });
      const prod = await prisma.product.update({ where: { id: Number(id) }, data });
      return res.json(prod);
    }
    if(req.method === 'DELETE'){ const { id } = req.query; await prisma.product.delete({ where: { id: Number(id) } }); return res.json({ ok:true }) }
    res.status(405).end()
  }catch(err){ console.error('admin/products error', err); res.status(500).json({ error:'server_error' }) }
}
