import { useState, useEffect } from 'react';
import { withAuth } from '../lib/withAuth';

function Profile() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user data
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setEmail(data.user.email);
        }
      });
    }
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auth/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, password: password || undefined })
    });
    if (res.ok) {
      setMessage('Profil aktualisiert');
      setPassword('');
    } else {
      setMessage('Fehler beim Aktualisieren');
    }
  }

  if (!user) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Ihr Profil</h1>
            <p className="text-gray-600">Verwalten Sie Ihre Kontoinformationen</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-0 border-b border-gray-300 bg-transparent focus:ring-0 focus:border-black transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neues Passwort (optional)
              </label>
              <input
                type="password"
                placeholder="Lassen Sie leer, um das Passwort beizubehalten"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-0 border-b border-gray-300 bg-transparent focus:ring-0 focus:border-black transition-colors placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Profil aktualisieren
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="w-full text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Profile);