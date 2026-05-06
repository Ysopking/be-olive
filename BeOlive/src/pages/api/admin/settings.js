import prisma from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  const auth = requireAuth(req, ['admin', 'manager'])
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  try {
    if (req.method === 'GET') {
      const settings = await prisma.setting.findMany()
      return res.status(200).json({ settings })
    }

    if (req.method === 'PUT') {
      const updates = req.body || {}
      const updated = []
      for (const key of Object.keys(updates)) {
        const value = updates[key] === undefined || updates[key] === null ? '' : String(updates[key])
        const existing = await prisma.setting.findUnique({ where: { key } })
        if (existing) {
          updated.push(await prisma.setting.update({ where: { key }, data: { value } }))
        } else {
          updated.push(await prisma.setting.create({ data: { key, value } }))
        }
      }
      return res.status(200).json({ settings: updated })
    }

    res.status(405).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'server_error' })
  }
}
