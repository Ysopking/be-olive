import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LegalPage() {
  const router = useRouter()
  const { slug } = router.query
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    async function loadPage() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/legal/${slug}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error || 'Seite nicht gefunden')
          setLoading(false)
          return
        }
        const data = await res.json()
        setPage(data.page)
      } catch (err) {
        console.error(err)
        setError('Fehler beim Laden der Seite')
      } finally {
        setLoading(false)
      }
    }
    loadPage()
  }, [slug])

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Lädt...</div>
  if (error) return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">Fehler</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link href="/" className="bg-black text-white px-6 py-3 rounded-full">Zurück zum Shop</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-light text-gray-900 mb-3">{page.title}</h1>
            <p className="text-sm uppercase tracking-widest text-gray-500">Rechtliche Informationen</p>
          </div>
          <div className="space-y-6 text-gray-700 leading-relaxed">
            {page.content.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
          <div className="mt-12">
            <Link href="/" className="text-black font-medium hover:underline">Zurück zum Shop</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
