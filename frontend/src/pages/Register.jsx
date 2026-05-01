import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Register() {
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(email, password)
    } catch {
      setError('Registration failed. Email may already be taken.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto' }}>
      <h2 style={{ marginBottom: '24px', color: '#7c6af7' }}>Create your account</h2>
      {error && <p style={{ color: '#f7748a', marginBottom: '12px' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{
          background: '#7c6af7', color: '#fff', border: 'none',
          padding: '12px', borderRadius: '8px', fontWeight: 'bold'
        }}>Create Account</button>
      </form>
      <p style={{ marginTop: '16px', color: '#6b6b80' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default Register