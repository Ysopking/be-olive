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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            Olivewood
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Handgefertigte Produkte aus nachhaltigem Olivenholz. Jedes Stück erzählt eine Geschichte von Tradition und Handwerkskunst.
          </p>
          <Link
            href="#products"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Entdecken
          </Link>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 bg-gray-50" id="products">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Produkte suchen..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-6 py-3 border-0 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-black focus:outline-none transition-shadow"
                />
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-6 py-3 border-0 rounded-2xl bg-white shadow-sm focus:ring-2 focus:ring-black focus:outline-none"
              >
                <option value="createdAt">Neueste</option>
                <option value="priceAsc">Preis aufsteigend</option>
                <option value="priceDesc">Preis absteigend</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts?.map(p => (
              <div key={p.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black transition-colors">
                    <Link href={`/product/${p.id}`}>{p.title}</Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{p.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">{(p.priceCents/100).toFixed(2)} €</span>
                    <Link
                      href={`/product/${p.id}`}
                      className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
                    >
                      Ansehen
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Keine Produkte gefunden.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
