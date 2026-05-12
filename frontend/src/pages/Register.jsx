import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

function Register() {
  const { register } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
    } catch {
      setError('Registration failed. Email may already be taken.')
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
              Start your productivity journey today
            </h2>
            <p className="auth-left__subtitle">
              Join FocusFlow and take control of your time, tasks, and goals.
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
          <p className="auth-right__label">Get started</p>
          <h1 className="auth-right__title">Create your account</h1>

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
                placeholder="Min 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Confirm Password</label>
              <input
                className="auth-field__input"
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Register