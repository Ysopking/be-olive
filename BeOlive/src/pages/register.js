import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (res.ok) {
      router.push('/login?message=Registrierung erfolgreich')
    } else {
      const data = await res.json()
      setError(data.error || 'Registrierung fehlgeschlagen')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-tight">Konto erstellen</h1>
          <p className="text-gray-600">Treten Sie unserer Community bei</p>
        </div>

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
          <div>
            <input
              type="password"
              placeholder="Passwort bestätigen"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-0 border-b border-gray-300 bg-transparent focus:ring-0 focus:border-black transition-colors placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            Registrieren
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Bereits ein Konto?{' '}
            <a href="/login" className="text-black font-medium hover:underline">
              Anmelden
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}