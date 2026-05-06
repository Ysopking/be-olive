import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { slug } = req.query
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const page = await prisma.legalPage.findUnique({ where: { slug } })
    if (!page) return res.status(404).json({ error: 'not_found' })
    return res.status(200).json({ page })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'server_error' })
  }
}
