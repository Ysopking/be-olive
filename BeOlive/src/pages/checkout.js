import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { CartContext } from '../context/cart'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalCents, clear } = useContext(CartContext)
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (router.query.success || router.query.paypal_success) {
      setMessage('Ihre Bestellung wurde verarbeitet. Vielen Dank!')
      clear()
    }
    if (router.query.canceled || router.query.paypal_cancel) {
      setError('Der Checkout wurde abgebrochen. Bitte versuchen Sie es erneut.')
    }
  }, [router.query, clear])

  async function handleCheckout(provider) {
    if (!email || !address) {
      setError('Bitte geben Sie E-Mail und Lieferadresse ein.')
      return
    }
    if (!acceptedTerms) {
      setError('Bitte stimmen Sie den AGB und Datenschutzbestimmungen zu.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch(`/api/checkout/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          acceptedTerms,
          customer: { email, address }
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Checkout fehlgeschlagen')
        setLoading(false)
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      if (data.success) {
        setMessage('Ihre Bestellung wurde erfolgreich aufgegeben. Danke für Ihren Einkauf!')
        clear()
      } else {
        setError('Checkout konnte nicht abgeschlossen werden.')
      }
    } catch (err) {
      console.error(err)
      setError('Beim Checkout ist ein Fehler aufgetreten.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Ihr Warenkorb ist leer</h1>
          <p className="text-gray-600 mb-8">Fügen Sie zuerst Produkte hinzu, um zur Kasse zu gehen.</p>
          <Link href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-gray-900 transition-colors">
            Zum Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h1 className="text-4xl font-light text-gray-900 mb-6">Kasse</h1>
              <p className="text-gray-600 mb-6">Geben Sie Ihre Daten ein, um den Checkout abzuschließen.</p>

              <div className="space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">E-Mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="name@beispiel.de"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Lieferadresse</span>
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                    rows={5}
                    placeholder="Straße, Hausnummer, PLZ, Stadt"
                    required
                  />
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={e => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-600">
                    Ich akzeptiere die <Link href="/legal/agb" className="font-medium text-black hover:underline">AGB</Link> und die <Link href="/legal/datenschutz" className="font-medium text-black hover:underline">Datenschutzbestimmungen</Link>.
                  </span>
                </label>
                {error && <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4">{error}</div>}
                {message && <div className="rounded-2xl border border-green-200 bg-green-50 text-green-700 p-4">{message}</div>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bestellübersicht</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between gap-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">Menge: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-gray-900">{((item.priceCents || 0) * item.quantity / 100).toFixed(2)} €</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Zwischensumme</span>
                  <span>{(totalCents/100).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Versand</span>
                  <span>4.90 €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Steuern</span>
                  <span>{(Math.round(totalCents * 0.19) / 100).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Gesamt</span>
                  <span>{((totalCents + 490 + Math.round(totalCents * 0.19))/100).toFixed(2)} €</span>
                </div>
              </div>
              <button
                onClick={() => handleCheckout('stripe')}
                disabled={loading}
                className="w-full bg-black text-white py-4 px-6 rounded-full font-medium hover:bg-gray-900 transition-colors duration-200"
              >
                {loading ? 'Bitte warten …' : 'Mit Stripe bezahlen'}
              </button>
              <button
                onClick={() => handleCheckout('paypal')}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-full font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                {loading ? 'Bitte warten …' : 'Mit PayPal bezahlen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
