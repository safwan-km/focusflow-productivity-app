import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { token, logout } = useAuth()

  if (!token) return null

  return (
    <nav style={{
      display: 'flex', gap: '20px', padding: '14px 24px',
      background: '#1a1a2e', alignItems: 'center'
    }}>
      <span style={{ color: '#7c6af7', fontWeight: 'bold', fontSize: '18px', marginRight: 'auto' }}>
        FocusFlow
      </span>
      <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
      <Link to="/tasks" style={{ color: '#fff', textDecoration: 'none' }}>Tasks</Link>
      <Link to="/timer" style={{ color: '#fff', textDecoration: 'none' }}>Timer</Link>
      <Link to="/planner" style={{ color: '#fff', textDecoration: 'none' }}>AI Planner</Link>
      <button onClick={logout} style={{
        background: '#7c6af7', color: '#fff', border: 'none',
        padding: '6px 14px', borderRadius: '6px', cursor: 'pointer'
      }}>Logout</button>
    </nav>
  )
}

export default Navbar