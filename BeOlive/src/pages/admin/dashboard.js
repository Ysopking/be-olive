import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminDashboard(){
  const [token, setToken] = useState('')
  const [data, setData] = useState({ payments: [], accounting: [], inventory: [], alerts: [] })
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    if (!storedToken) {
      router.push('/admin/products')
      return
    }
    setToken(storedToken)
    loadDashboard()
  }, [])

  async function loadDashboard(){
    const res = await fetch('/api/admin/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
    if (res.ok) {
      const d = await res.json()
      setData(d)
    } else {
      alert('Auth fehlgeschlagen')
      localStorage.removeItem('adminToken')
      router.push('/admin/products')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-2">Übersicht über Ihr Geschäft</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Payments Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Zahlungseingänge</h3>
            <div className="space-y-2">
              {data.payments.slice(0, 3).map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{p.orderNumber}</span>
                  <span className="font-medium">{(p.totalCents/100).toFixed(2)} €</span>
                </div>
              ))}
              {data.payments.length === 0 && (
                <p className="text-gray-500 text-sm">Keine Zahlungen</p>
              )}
            </div>
          </div>

          {/* Accounting Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Buchhaltung</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gesamtumsatz</span>
                <span className="font-medium">{data.accounting.totalRevenue ? (data.accounting.totalRevenue/100).toFixed(2) : 0} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Offene Rechnungen</span>
                <span className="font-medium">{data.accounting.pending || 0}</span>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Warenwirtschaft</h3>
            <div className="space-y-2">
              {data.inventory.slice(0, 3).map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate">{i.title}</span>
                  <span className="font-medium">{i.stock} Stk</span>
                </div>
              ))}
              {data.inventory.length === 0 && (
                <p className="text-gray-500 text-sm">Kein Inventar</p>
              )}
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Alerts</h3>
            <div className="space-y-2">
              {data.alerts.slice(0, 3).map(a => (
                <div key={a.id} className="text-sm text-red-600">
                  {a.message}
                </div>
              ))}
              {data.alerts.length === 0 && (
                <p className="text-gray-500 text-sm">Keine Alerts</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Schnellzugriff</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/products" className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Produkte verwalten</div>
                <div className="text-sm text-gray-600">Inventar und Preise</div>
              </div>
            </a>
            <a href="/admin/orders" className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Bestellungen</div>
                <div className="text-sm text-gray-600">Verarbeitung und Versand</div>
              </div>
            </a>
            <a href="/admin/compliance" className="flex items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Compliance</div>
                <div className="text-sm text-gray-600">Rechtliche Seiten & Einstellungen</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}