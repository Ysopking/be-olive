import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (router.query.message) setMessage(router.query.message)
  }, [router.query])

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('token', data.token)
      router.push('/profile')
    } else {
      const data = await res.json()
      setError(data.error || 'Login fehlgeschlagen')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight">Willkommen zurück</h1>
          <p className="text-gray-600">Melden Sie sich an, um fortzufahren</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="E-Mail-Adresse"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-0 border-b border-gray-300 bg-transparent focus:ring-0 focus:border-black transition-colors placeholder-gray-400"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-0 border-b border-gray-300 bg-transparent focus:ring-0 focus:border-black transition-colors placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Anmelden
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Noch kein Konto?{' '}
            <a href="/register" className="text-black font-medium hover:underline">
              Registrieren
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}