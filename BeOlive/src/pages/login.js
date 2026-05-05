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
    <div className="container max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Anmelden</h1>
      {message && <p className="text-green-500 mb-4">{message}</p>}
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
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Anmelden</button>
      </form>
      <p className="mt-4">Noch kein Konto? <a href="/register" className="text-blue-600">Registrieren</a></p>
    </div>
  )
}