import Link from 'next/link'
import useSWR from 'swr'
const fetcher = (url) => fetch(url).then(r => r.json())
export default function Home() {
  const { data: products } = useSWR('/api/products', fetcher, { refreshInterval: 0 })
  return (
    <div className="container">
      <h1 className="text-3xl font-bold mb-6">Olivewood — Handgefertigte Produkte</h1>
      <div>
        {products?.map(p => (
          <article key={p.id} className="border rounded p-4 mb-4">
            <h2 className="text-xl font-semibold"><Link href={`/product/${p.id}`}>{p.title}</Link></h2>
            <p className="mt-2">{p.description}</p>
            <div className="mt-4 font-bold">{(p.priceCents/100).toFixed(2)} {p.currency}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
