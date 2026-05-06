import { useContext } from 'react'
import { useRouter } from 'next/router'
import { CartContext } from '../context/cart'
export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalCents, clear } = useContext(CartContext)
  function goToCheckout() {
    router.push('/checkout')
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-12 tracking-tight">Warenkorb</h1>

          {items.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Dein Warenkorb ist leer</h2>
              <p className="text-gray-600 mb-8">Entdecke unsere handgefertigten Olivenholz-Produkte</p>
              <a href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200">
                Shoppen
              </a>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map(it => (
                  <div key={it.productId} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{it.title}</h3>
                        <p className="text-gray-600">{(it.priceCents/100).toFixed(2)} € pro Stück</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(it.productId, Math.max(1, it.quantity - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-medium">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {(it.priceCents * it.quantity / 100).toFixed(2)} €
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(it.productId)}
                          className="w-8 h-8 rounded-full border border-red-200 flex items-center justify-center hover:border-red-300 hover:bg-red-50 transition-colors ml-4"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-3xl p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Bestellübersicht</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zwischensumme</span>
                    <span className="font-medium">{(totalCents/100).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versand</span>
                    <span className="font-medium">4.90 €</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Gesamt</span>
                    <span>{((totalCents + 490)/100).toFixed(2)} €</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={goToCheckout}
                    className="w-full bg-black text-white py-4 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
                  >
                    Zur Kasse gehen
                  </button>
                  <button
                    onClick={clear}
                    className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-300 transition-colors duration-200"
                  >
                    Warenkorb leeren
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
