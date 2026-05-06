import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminOrders() {
  const [token, setToken] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    if (!storedToken) {
      router.push('/admin/products')
      return
    }
    setToken(storedToken)
    loadOrders(storedToken)
  }, [])

  async function loadOrders(authToken) {
    setLoading(true)
    const res = await fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${authToken}` } })
    if (!res.ok) {
      localStorage.removeItem('adminToken')
      router.push('/admin/products')
      return
    }
    const data = await res.json()
    setOrders(data)
    setLoading(false)
  }

  async function updateOrder(id, fields) {
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...fields })
    })
    if (res.ok) loadOrders(token)
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Lädt Bestellungen...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">Bestellverwaltung</h1>
          <p className="text-gray-600 mt-2">Hier können Sie Bestellungen einsehen und den Lieferstatus pflegen.</p>
        </div>
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Bestellung {order.orderNumber}</h2>
                  <p className="text-gray-500">{order.email || 'Kein Kunde'} · {new Date(order.createdAt).toLocaleDateString('de-DE')}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700">Status: <span className="font-semibold">{order.status}</span></p>
                  <p className="text-gray-700">Gesamt: {(order.totalCents/100).toFixed(2)} €</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="rounded-3xl border border-gray-200 p-4">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Zahlung</h3>
                  <p className="text-gray-900">{order.paid ? 'Bezahlt' : 'Offen'}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 p-4">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Versand</h3>
                  <p className="text-gray-900">{order.shippingTracking || 'Kein Tracking'}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 p-4">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Retouren</h3>
                  <p className="text-gray-900">{order.returned ? 'Ja' : 'Nein'}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select defaultValue={order.status} onChange={e => updateOrder(order.id, { status: e.target.value })} className="w-full border p-3 rounded-2xl">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tracking Nummer</label>
                  <input defaultValue={order.shippingTracking || ''} onBlur={e => updateOrder(order.id, { trackingNumber: e.target.value })} className="w-full border p-3 rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
