import prisma from './prisma'
export async function createAccountingEntry({ orderId, amountCents, type, description }) {
  try {
    if (!prisma.accountingEntry) return null
    const entry = await prisma.accountingEntry.create({ data: { orderId: orderId ? Number(orderId) : null, amountCents: Number(amountCents||0), type: type || 'sale', description: description || '' } })
    return entry
  } catch (e) { console.warn('createAccountingEntry skipped', e.message); return null }
}
