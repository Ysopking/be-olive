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
