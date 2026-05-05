import Link from 'next/link'
import { useState, useMemo } from 'react'
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then(r => r.json())
export default function Home() {
  const { data: products } = useSWR('/api/products', fetcher, { refreshInterval: 0 })
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')

  const filteredProducts = useMemo(() => {
    if (!products) return []
    let filtered = products.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    )
    if (sortBy === 'priceAsc') filtered.sort((a,b) => a.priceCents - b.priceCents)
    else if (sortBy === 'priceDesc') filtered.sort((a,b) => b.priceCents - a.priceCents)
    else filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    return filtered
  }, [products, search, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Olivewood</h1>
          <p className="text-gray-600">Handgefertigte Produkte aus Olivenholz</p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Produkte suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
            <option value="createdAt">Neueste</option>
            <option value="priceAsc">Preis aufsteigend</option>
            <option value="priceDesc">Preis absteigend</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.map(p => (
            <div key={p.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link href={`/product/${p.id}`} className="hover:text-blue-600">{p.title}</Link>
                </h2>
                <p className="text-gray-600 mb-4">{p.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">{(p.priceCents/100).toFixed(2)} €</span>
                  <Link href={`/product/${p.id}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Ansehen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
