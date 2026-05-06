import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminCompliance() {
  const [token, setToken] = useState('')
  const [legalPages, setLegalPages] = useState([])
  const [settings, setSettings] = useState({})
  const [form, setForm] = useState({ id: null, slug: '', title: '', content: '' })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken')
    if (!storedToken) {
      router.push('/admin/products')
      return
    }
    setToken(storedToken)
    loadData(storedToken)
  }, [])

  async function loadData(authToken) {
    setLoading(true)
    const [pagesRes, settingsRes] = await Promise.all([
      fetch('/api/admin/legal-pages', { headers: { Authorization: `Bearer ${authToken}` } }),
      fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${authToken}` } })
    ])
    if (!pagesRes.ok || !settingsRes.ok) {
      localStorage.removeItem('adminToken')
      router.push('/admin/products')
      return
    }
    const pagesData = await pagesRes.json()
    const settingsData = await settingsRes.json()
    setLegalPages(pagesData.pages || [])
    setSettings(settingsData.settings.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}))
    setLoading(false)
  }

  function resetForm() {
    setForm({ id: null, slug: '', title: '', content: '' })
  }

  async function savePage(e) {
    e.preventDefault()
    const method = form.id ? 'PUT' : 'POST'
    const url = '/api/admin/legal-pages'
    const body = form.id ? { id: form.id, slug: form.slug, title: form.title, content: form.content } : { slug: form.slug, title: form.title, content: form.content }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    if (res.ok) {
      resetForm()
      loadData(token)
    }
  }

  async function deletePage(id) {
    if (!confirm('Diese Seite wirklich löschen?')) return
    const res = await fetch(`/api/admin/legal-pages?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) loadData(token)
  }

  async function editPage(page) {
    setForm({ id: page.id, slug: page.slug, title: page.title, content: page.content })
  }

  async function saveSettings() {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings)
    })
    if (res.ok) loadData(token)
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">Lädt...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-light text-gray-900 tracking-tight">Compliance & Recht</h1>
          <p className="text-gray-600 mt-2">Pflege Ihre rechtlichen Seiten und Einstellungen zentral.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6">Rechtliche Seiten</h2>
            <div className="space-y-4 mb-8">
              {legalPages.map(page => (
                <div key={page.id} className="border border-gray-200 rounded-3xl p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{page.title}</div>
                      <div className="text-sm text-gray-500">/{page.slug}</div>
                    </div>
                    <div className="text-sm text-gray-500">Aktualisiert: {new Date(page.updatedAt).toLocaleDateString('de-DE')}</div>
                  </div>
                  <div className="mt-4 flex gap-3 flex-wrap">
                    <button onClick={() => editPage(page)} className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900 transition">Bearbeiten</button>
                    <button onClick={() => deletePage(page.id)} className="text-sm bg-red-100 text-red-700 px-4 py-2 rounded-full hover:bg-red-200 transition">Löschen</button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={createPage} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="border p-3 rounded-2xl w-full" required />
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Titel" className="border p-3 rounded-2xl w-full" required />
              </div>
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Inhalt" rows={6} className="border p-3 rounded-2xl w-full" required />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="submit" className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 transition">
                  {form.id ? 'Seite aktualisieren' : 'Neue Seite anlegen'}
                </button>
                {form.id && (
                  <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition">
                    Abbrechen
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6">Shop Einstellungen</h2>
            <div className="space-y-4">
              {['companyName', 'companyAddress', 'taxId', 'shopEmail', 'shippingInfo', 'paymentInfo'].map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{key}</label>
                  <input
                    value={settings[key] || ''}
                    onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                    className="border p-3 rounded-2xl w-full"
                  />
                </div>
              ))}
            </div>
            <button onClick={saveSettings} className="mt-6 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 transition">Einstellungen speichern</button>
          </div>
        </div>
      </div>
    </div>
  )
}
