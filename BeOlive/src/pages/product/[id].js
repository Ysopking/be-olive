import { useContext, useState } from 'react'
import { CartContext } from '../../context/cart'
import Link from 'next/link'
import prisma from '../../lib/prisma'

export default function ProductPage({ product, similarProducts }) {
  const { addItem } = useContext(CartContext)
  const [quantity, setQuantity] = useState(1)

  if (!product) return <div className="container"><p>Produkt nicht gefunden</p></div>

  function addToCart(){
    addItem({ productId: product.id, title: product.title, priceCents: product.priceCents, currency: product.currency||'EUR', quantity });
    alert(`${quantity}x ${product.title} zum Warenkorb hinzugefügt`)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                {product.title}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {product.description}
              </p>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {(product.priceCents/100).toFixed(2)} €
              </div>
              <p className="text-sm text-gray-500 mb-8">
                Verfügbar: {product.stock} Stück
              </p>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Menge
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={addToCart}
                className="w-full bg-black text-white py-4 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 mb-4"
                disabled={product.stock < 1}
              >
                {product.stock < 1 ? 'Nicht verfügbar' : `In Warenkorb • ${(product.priceCents * quantity / 100).toFixed(2)} €`}
              </button>

              <Link
                href="/cart"
                className="text-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                Zum Warenkorb
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-24">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-light text-gray-900 mb-12 text-center tracking-tight">
                Ähnliche Produkte
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarProducts.map(p => (
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
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  const id = Number(params.id)
  if (!id) return { props: { product: null, similarProducts: [] } }
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        priceCents: true,
        currency: true,
        image: true,
        sku: true,
        stock: true,
        weightGram: true
      }
    })
    const similarProducts = await prisma.product.findMany({
      where: { id: { not: id } },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        priceCents: true,
        currency: true,
        image: true,
        sku: true,
        stock: true,
        weightGram: true
      }
    })
    return { props: { product, similarProducts } }
  } catch (error) {
    console.error('Product fetch error:', error)
    return { props: { product: null, similarProducts: [] } }
  }
}
