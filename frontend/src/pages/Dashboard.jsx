import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from 'recharts'
import { fetchDashboard } from '../api'
import '../styles/Dashboard.css'

const FOCUS_QUOTES = [
  {
    text: "Focus is not about saying yes to the thing you've got to focus on. It's about saying no to everything else.",
    author: "Steve Jobs",
  },
  {
    text: "The successful warrior is the average person, with laser-like focus.",
    author: "Bruce Lee",
  },
  {
    text: "Concentrate all your thoughts upon the work in hand.",
    author: "Alexander Graham Bell",
  },
  {
    text: "You will never reach your destination if you stop and throw stones at every dog that barks.",
    author: "Winston Churchill",
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
  },
  {
    text: "Lack of direction, not lack of time, is the problem.",
    author: "Zig Ziglar",
  },
  {
    text: "The key to success is to focus our conscious mind on things we desire, not things we fear.",
    author: "Brian Tracy",
  },
]

function getDailyQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const today = new Date()
  const diff = today - start
  const dayOfYear = Math.floor(diff / 86400000)

  return FOCUS_QUOTES[dayOfYear % FOCUS_QUOTES.length]
}


function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).toUpperCase()
}

function getDisplayName(email) {
  const storedName = localStorage.getItem('userName') || ''
  if (storedName) return storedName
  if (!email) return 'User'
  const name = email.split('@')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function formatDelta(value, unit, positiveText, negativeText, sameText) {
  if (value === 0) return sameText
  const abs = Math.abs(value)
  const label = `${abs} ${unit}${abs === 1 ? '' : 's'}`
  return value > 0 ? `${label} ${positiveText}` : `${label} ${negativeText}`
}

function FocusDot(props) {
  const { cx, cy, payload } = props
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload?.is_today ? 5 : 4}
      fill={payload?.is_today ? '#b87820' : '#5c7a28'}
      stroke="#fffdf7"
      strokeWidth="2"
    />
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const quote = getDailyQuote()

  useEffect(() => {
    setLoading(true)
    fetchDashboard(weekOffset)
      .then(data => {
        setStats(data)
        setError('')
      })
      .catch(() => {
        setError('Failed to load dashboard')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [weekOffset])

  const userName = useMemo(() => {
    const email = stats?.user_email || localStorage.getItem('userEmail')
    return getDisplayName(email)
  }, [stats])

  const taskData = stats?.week?.tasks_per_day || []
  const focusData = stats?.week?.focus_hours_per_day || []
  const hasTaskData = taskData.some(item => item.tasks > 0)
  const hasFocusData = focusData.some(item => item.hours > 0)

  if (loading) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-loading">Loading dashboard...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <p className="dashboard-error">{error}</p>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <p className="dashboard-date">{getFormattedDate()}</p>
        <h1>{getGreeting()}, {userName}.</h1>
        <p>
          {stats.pending_tasks} active tasks, {stats.due_today_tasks} due today.
          {' '}You're on a {stats.streak_days}-day activity streak.
        </p>
      </section>

      <section className="dashboard-quote">
        <span>"</span>
        <div>
          <p>{quote.text}</p>
          <small>- {quote.author}</small>
        </div>
      </section>


      <section className="dashboard-stats">
        <div className="stat-card stat-card--green">
          <p className="stat-label">TODAY</p>
          <h2>{stats.tasks_today}</h2>
          <p>tasks completed</p>
          <small>
            {formatDelta(
              stats.tasks_today_delta,
              'task',
              'more than yesterday',
              'less than yesterday',
              'same as yesterday'
            )}
          </small>
        </div>

        <div className="stat-card stat-card--gold">
          <p className="stat-label">THIS WEEK</p>
          <h2>{stats.tasks_this_week}</h2>
          <p>tasks done</p>
          <small>
            {formatDelta(
              stats.tasks_week_delta,
              'task',
              'more than previous week',
              'less than previous week',
              'same as previous week'
            )}
          </small>
        </div>

        <div className="stat-card stat-card--orange">
          <p className="stat-label">STREAK</p>
          <h2>{stats.streak_days}</h2>
          <p>days in a row</p>
          <small>
            {stats.streak_days > 0 && stats.is_personal_best
              ? 'Personal best'
              : `Best: ${stats.longest_streak_days} days`}
          </small>
        </div>
      </section>

      <section className="dashboard-charts-header">
        <div>
          <h2>Weekly Performance</h2>
          <p>{stats.week.start} to {stats.week.end}</p>
        </div>

        <div className="dashboard-week-toggle">
          <button
            className={weekOffset === 0 ? 'active' : ''}
            onClick={() => setWeekOffset(0)}
          >
            This Week
          </button>
          <button
            className={weekOffset === -1 ? 'active' : ''}
            onClick={() => setWeekOffset(-1)}
          >
            Previous Week
          </button>
        </div>
      </section>

      <section className="dashboard-charts">
        <div className="chart-card">
          <h3><span />Tasks per day</h3>

          {hasTaskData ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={taskData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} domain={[0, dataMax => Math.max(1, dataMax)]} />
                <Tooltip
                  formatter={(value) => [`${value} tasks`, 'Completed']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
                />
                <Bar dataKey="tasks" radius={[4, 4, 0, 0]}>
                  {taskData.map(item => (
                    <Cell
                      key={item.date}
                      fill={item.is_today ? '#5c7a28' : '#e8e2d2'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No tasks completed this week</div>
          )}
        </div>

        <div className="chart-card">
          <h3><span />Focus hours</h3>

          {hasFocusData ? (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={focusData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, dataMax => Math.max(1, dataMax)]} />
                <Tooltip
                  formatter={(value) => [`${value} hours`, 'Focus']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#5c7a28"
                  strokeWidth={3}
                  dot={<FocusDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No focus sessions this week</div>
          )}
        </div>
      </section>

      <section className="upcoming-card">
        <div className="upcoming-card__header">
          <h3><span />Upcoming tasks</h3>
          <p>{stats.overdue_tasks} overdue</p>
        </div>

        {stats.upcoming_tasks.length === 0 ? (
          <div className="dashboard-placeholder">
            <p>No upcoming tasks. You're clear for now.</p>
          </div>
        ) : (
          <div className="upcoming-list">
            {stats.upcoming_tasks.map(task => (
              <div className="upcoming-row" key={task.id}>
                <div>
                  <p>{task.title}</p>
                  <small>{task.category}</small>
                </div>
                <span className={`priority-pill priority-pill--${task.priority}`}>
                  {task.priority}
                </span>
                <span className={task.is_overdue ? 'due-badge overdue' : 'due-badge'}>
                  {task.due_label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Dashboard
