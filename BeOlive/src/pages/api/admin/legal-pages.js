import prisma from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'
import { sanitizeString } from '../../../lib/validation'

export default async function handler(req, res) {
  const auth = requireAuth(req, ['admin', 'manager'])
  if (auth.error) return res.status(auth.status).json({ error: auth.error })

  try {
    if (req.method === 'GET') {
      const pages = await prisma.legalPage.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json({ pages })
    }

    if (req.method === 'POST') {
      const { slug, title, content } = req.body
      if (!slug || !title || !content) return res.status(400).json({ error: 'slug_title_content_required' })
      const page = await prisma.legalPage.create({
        data: {
          slug: sanitizeString(slug.toLowerCase()),
          title: sanitizeString(title),
          content: String(content)
        }
      })
      return res.status(201).json({ page })
    }

    if (req.method === 'PUT') {
      const { id, slug, title, content } = req.body
      if (!id) return res.status(400).json({ error: 'id_required' })
      const page = await prisma.legalPage.update({
        where: { id: Number(id) },
        data: {
          slug: slug ? sanitizeString(slug.toLowerCase()) : undefined,
          title: title ? sanitizeString(title) : undefined,
          content: content ? String(content) : undefined
        }
      })
      return res.status(200).json({ page })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      if (!id) return res.status(400).json({ error: 'id_required' })
      await prisma.legalPage.delete({ where: { id: Number(id) } })
      return res.status(200).json({ ok: true })
    }

    res.status(405).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'server_error' })
  }
}
