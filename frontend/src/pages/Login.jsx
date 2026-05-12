import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

function Login() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* ── Left Panel ── */}
        <div className="auth-left">
          <div className="auth-left__brand">
            <div className="auth-left__brand-icon">F</div>
            <div className="auth-left__brand-name">
              Focus<span>Flow</span>
            </div>
          </div>

          <div className="auth-left__content">
            <h2 className="auth-left__title">
              Your personal productivity companion
            </h2>
            <p className="auth-left__subtitle">
              Stay focused, track your progress, and achieve more every day.
            </p>
          </div>

          <div className="auth-left__features">
            <div className="auth-left__feature">
              <span className="auth-left__feature-dot" />
              AI-powered daily planning
            </div>
            <div className="auth-left__feature">
              <span className="auth-left__feature-dot" />
              Pomodoro focus timer
            </div>
            <div className="auth-left__feature">
              <span className="auth-left__feature-dot" />
              Task management and tracking
            </div>
            <div className="auth-left__feature">
              <span className="auth-left__feature-dot" />
              Weekly productivity insights
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="auth-right">
          <p className="auth-right__label">Welcome back</p>
          <h1 className="auth-right__title">Sign in to FocusFlow</h1>

          {error && (
            <div className="auth-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-field__label">Email</label>
              <input
                className="auth-field__input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Password</label>
              <input
                className="auth-field__input"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login