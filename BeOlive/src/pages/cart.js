import { useContext } from 'react'
import { CartContext } from '../context/cart'
export default function CartPage() {
  const { items, removeItem, updateQuantity, totalCents, clear } = useContext(CartContext)
  async function checkoutStripe() {
    const res = await fetch('/api/checkout/stripe', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items, acceptedTerms: true }) })
    if (res.redirected) window.location.href = res.url
    else alert('Fehler beim Checkout')
  }
  async function checkoutPayPal() {
    const res = await fetch('/api/checkout/paypal', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items, acceptedTerms: true }) })
    if (res.redirected) window.location.href = res.url
    else alert('Fehler beim Checkout')
  }
  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-4">Warenkorb</h1>
      {items.length===0 ? <p>Dein Warenkorb ist leer.</p> : (
        <div>
          <ul>
            {items.map(it => (
              <li key={it.productId} className="flex justify-between items-center border-b py-3">
                <div>
                  <div className="font-semibold">{it.title}</div>
                  <div className="text-sm text-gray-600">{(it.priceCents/100).toFixed(2)} {it.currency||'EUR'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min="1" value={it.quantity} onChange={(e)=> updateQuantity(it.productId, Number(e.target.value))} className="w-16 border p-1" />
                  <button onClick={()=> removeItem(it.productId)} className="text-red-600">Entfernen</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 font-bold">Zwischensumme: {(totalCents/100).toFixed(2)} EUR</div>
          <div className="mt-2">Versand: 4.90 EUR</div>
          <div className="mt-2 text-xl font-bold">Gesamt: {((totalCents+490)/100).toFixed(2)} EUR</div>
          <div className="mt-4 flex gap-3">
            <button onClick={checkoutStripe} className="px-4 py-2 bg-green-600 text-white rounded">Bezahle mit Stripe</button>
            <button onClick={checkoutPayPal} className="px-4 py-2 bg-blue-600 text-white rounded">Bezahle mit PayPal</button>
            <button onClick={clear} className="px-4 py-2 bg-gray-300">Leeren</button>
          </div>
        </div>
      )}
    </div>
  )
}
