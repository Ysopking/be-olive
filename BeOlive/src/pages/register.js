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
    <div className="container max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Registrieren</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        <input
          type="password"
          placeholder="Passwort bestätigen"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full border p-2 mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Registrieren</button>
      </form>
    </div>
  )
}