import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Navbar.css'

/* ── SVG Icons ── */
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const TasksIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <polyline points="3 6 4 7 6 5"/>
    <polyline points="3 12 4 13 6 11"/>
    <polyline points="3 18 4 19 6 17"/>
  </svg>
)

const TimerIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="13" r="8"/>
    <polyline points="12 9 12 13 14.5 15.5"/>
    <path d="M9 3h6"/>
    <path d="M12 3v2"/>
  </svg>
)

const PlannerIcon = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

function Navbar() {
  const { token, logout } = useAuth()

  if (!token) return null

  const email = localStorage.getItem('userEmail') || 'user@email.com'
  const storedName = localStorage.getItem('userName') || ''
  const initials = storedName
    ? storedName.slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase()
  const displayName = storedName || email.split('@')[0]
  const navigate = useNavigate()

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">F</div>
        <div className="sidebar__brand-name">
          Focus<span>Flow</span>
        </div>
      </div>

      {/* Menu Label */}
      <p className="sidebar__menu-label">Menu</p>

      {/* Links */}
      <div className="sidebar__links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'sidebar__link active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon"><DashboardIcon /></span>
          Dashboard
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? 'sidebar__link active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon"><TasksIcon /></span>
          Tasks
        </NavLink>

        <NavLink
          to="/timer"
          className={({ isActive }) =>
            isActive ? 'sidebar__link active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon"><TimerIcon /></span>
          Timer
        </NavLink>

        <NavLink
          to="/planner"
          className={({ isActive }) =>
            isActive ? 'sidebar__link active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon"><PlannerIcon /></span>
          AI Planner
        </NavLink>
      </div>

      {/* Divider */}
      <div className="sidebar__divider" />

      {/* Logout */}
      <button className="sidebar__logout" onClick={logout}>
        <span className="sidebar__icon"><LogoutIcon /></span>
        Logout
      </button>

      {/* User — clickable to go to profile */}
      <div
        className="sidebar__user"
        onClick={() => navigate('/profile')}
        style={{ cursor: 'pointer' }}
      >
        <div className="sidebar__avatar">{initials}</div>
        <div className="sidebar__user-info">
          <p className="sidebar__user-name">{displayName}</p>
          {/* Add role later */}
          {/* <p className="sidebar__user-role">Role</p> */}
        </div>
      </div>

    </aside>
  )
}

export default Navbar