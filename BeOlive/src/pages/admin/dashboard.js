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
    <div className="container">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Zahlungseingänge</h2>
          <ul>
            {data.payments.slice(0,5).map(p => (
              <li key={p.id} className="text-sm">{p.orderNumber}: {(p.totalCents/100).toFixed(2)} €</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Buchhaltung</h2>
          <p>Gesamtumsatz: {data.accounting.totalRevenue ? (data.accounting.totalRevenue/100).toFixed(2) : 0} €</p>
          <p>Offene Rechnungen: {data.accounting.pending || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Warenwirtschaft</h2>
          <ul>
            {data.inventory.slice(0,5).map(i => (
              <li key={i.id} className="text-sm">{i.title}: {i.stock} Stück</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Alerts</h2>
          <ul>
            {data.alerts.slice(0,5).map(a => (
              <li key={a.id} className="text-sm text-red-500">{a.message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}