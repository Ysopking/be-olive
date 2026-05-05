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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Profil</h1>
      {message && <p className="mb-4">{message}</p>}
      <form onSubmit={handleUpdate}>
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
          placeholder="Neues Passwort (optional)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 mb-4"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Aktualisieren</button>
      </form>
    </div>
  );
}

export default withAuth(Profile);