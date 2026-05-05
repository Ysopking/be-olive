import { useEffect, useState } from 'react'
export default function AdminProducts(){
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [auth, setAuth] = useState(false); const [token, setToken] = useState(''); const [products, setProducts] = useState([]); const [form, setForm] = useState({ title:'', slug:'', description:'', price:'', stock:0, image:'', sku:''}); const [showForm, setShowForm] = useState(false)
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      setAuth(true);
    }
  }, []);
  useEffect(() => { if (auth && token) load() }, [auth, token]);
  async function load() {
    const res = await fetch('/api/admin/products', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.status === 200) setProducts(await res.json());
    else {
      alert('Auth fehlgeschlagen');
      setAuth(false);
      setToken('');
      localStorage.removeItem('adminToken');
    }
  }
  async function login(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.status === 200) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
      setAuth(true);
    } else {
      alert('Login fehlgeschlagen');
    }
  }
  async function createProduct(e) {
    e.preventDefault();
    const body = { title: form.title, slug: form.slug || form.title.toLowerCase().replace(/\s+/g,'-'), description: form.description, priceCents: Math.round(parseFloat(form.price||0)*100), currency: 'EUR', image: form.image, sku: form.sku, stock: Number(form.stock||0) };
    const res = await fetch('/api/admin/products', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) });
    if (res.status === 201) {
      setForm({ title:'', slug:'', description:'', price:'', stock:0, image:'', sku:'' });
      load();
    } else alert('Fehler beim Erstellen');
  }
  async function del(id) {
    if (!confirm('Produkt löschen?')) return;
    await fetch('/api/admin/products?id='+id, { method:'DELETE', headers:{ 'Authorization': `Bearer ${token}` } });
    load();
  }
  return (
    <div className="container">
      {!auth && (
        <form onSubmit={login} className="max-w-md">
          <h2 className="text-xl font-bold mb-2">Admin Login</h2>
          <input type="email" className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" className="border p-2 w-full" placeholder="Passwort" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="mt-2 px-3 py-2 bg-gray-800 text-white rounded">Login</button>
        </form>
      )}
      {auth && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Produktverwaltung</h1>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {showForm ? 'Abbrechen' : 'Neues Produkt'}
            </button>
          </div>
          {showForm && (
            <form onSubmit={createProduct} className="bg-gray-100 p-6 rounded mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="border p-2" placeholder="Titel" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} required />
                <input className="border p-2" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug: e.target.value})} />
                <input className="border p-2" placeholder="Preis (EUR)" type="number" step="0.01" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} required />
                <input className="border p-2" placeholder="Bestand" type="number" value={form.stock} onChange={e=>setForm({...form, stock: e.target.value})} required />
                <input className="border p-2" placeholder="Bild URL" value={form.image} onChange={e=>setForm({...form, image: e.target.value})} />
                <input className="border p-2" placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku: e.target.value})} />
              </div>
              <textarea className="w-full border p-2 mt-4" placeholder="Beschreibung" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Erstellen</button>
            </form>
          )}
          <div className="bg-white shadow rounded">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Titel</th>
                  <th className="px-4 py-2 text-left">Preis</th>
                  <th className="px-4 py-2 text-left">Bestand</th>
                  <th className="px-4 py-2 text-left">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{(p.priceCents/100).toFixed(2)} €</td>
                    <td className="px-4 py-2">{p.stock}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <a className="px-2 py-1 bg-blue-600 text-white rounded text-sm" href={`/product/${p.id}`} target="_blank">Ansehen</a>
                      <button onClick={()=>del(p.id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Löschen</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
