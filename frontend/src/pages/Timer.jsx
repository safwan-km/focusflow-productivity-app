import { useState, useEffect, useRef } from 'react'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/Toast'
import { fetchTasks, createSession, fetchSessions } from '../api'
import '../styles/Timer.css'

const MODES = {
  focus:       { label: 'Focus',       minutes: 25, color: '#5C7A28' },
  short_break: { label: 'Short Break', minutes: 5,  color: '#B87820' },
  long_break:  { label: 'Long Break',  minutes: 15, color: '#B87820' },
}

function Timer() {
  const [mode, setMode]               = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isRunning, setIsRunning]     = useState(false)
  const [sessionsToday, setSessionsToday] = useState([])
  const [completedSessions, setCompletedSessions] = useState(0)
  const [tasks, setTasks]             = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const intervalRef                   = useRef(null)
  const { toasts, showToast, removeToast } = useToast()

  const totalSeconds = MODES[mode].minutes * 60
  const radius = 116
  const circumference = 2 * Math.PI * radius
  const progress = secondsLeft / totalSeconds
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  // ── Load tasks and sessions on mount ──
  useEffect(() => {
    fetchTasks().then(setTasks).catch(() => {})
    fetchSessions().then(data => {
      const today = new Date().toDateString()
      const todaySessions = data.filter(s =>
        new Date(s.created_at).toDateString() === today
      )
      setSessionsToday(todaySessions)
      setCompletedSessions(todaySessions.filter(s => s.duration_mins === 25).length)
    }).catch(() => {})
  }, [])

  // ── Timer tick ──
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, mode])

  // ── When mode changes reset timer ──
  const switchMode = (newMode) => {
    setMode(newMode)
    setIsRunning(false)
    setSecondsLeft(MODES[newMode].minutes * 60)
  }

  // ── Timer complete ──
  const handleComplete = async () => {
    setIsRunning(false)
    if (mode === 'focus') {
      try {
        const session = await createSession({
          task_id:      selectedTaskId ? parseInt(selectedTaskId) : null,
          duration_mins: 25,
        })
        setSessionsToday(prev => [...prev, session])
        setCompletedSessions(prev => prev + 1)
        showToast('Focus session complete! Great work 🎉', 'success')
      } catch {
        showToast('Session done but failed to save', 'error')
      }
    } else {
      showToast('Break time over! Ready to focus?', 'info')
    }
  }

  // ── Controls ──
  const handleStartPause = () => setIsRunning(prev => !prev)

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(MODES[mode].minutes * 60)
  }

  // ── Stats ──
  const totalFocusMins = sessionsToday
    .filter(s => s.duration_mins === 25)
    .reduce((sum, s) => sum + s.duration_mins, 0)

  return (
    <div className="timer-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="timer-header">
        <p className="timer-header__label">FocusFlow</p>
        <h1 className="timer-header__title">Focus Timer</h1>
      </div>

      <div className="timer-layout">

        {/* ── Left: Timer Card ── */}
        <div className="timer-card">

          {/* Mode tabs */}
          <div className="timer-modes">
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                className={`timer-mode-btn ${mode === key ? 'active' : ''}`}
                onClick={() => switchMode(key)}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* Circle */}
          <div className="timer-circle-wrap">
            <svg className="timer-circle-svg" viewBox="0 0 260 260">
              <circle
                className="timer-circle-bg"
                cx="130" cy="130" r={radius}
              />
              <circle
                className={`timer-circle-progress ${mode !== 'focus' ? 'break' : ''}`}
                cx="130" cy="130" r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="timer-display">
              <div className="timer-display__time">{minutes}:{seconds}</div>
              <div className="timer-display__mode">{MODES[mode].label}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="timer-controls">

            {/* Reset */}
            <button className="timer-btn--secondary" onClick={handleReset}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>

            {/* Start/Pause */}
            <button className="timer-btn--primary" onClick={handleStartPause}>
              {isRunning ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              )}
            </button>

            {/* Skip */}
            <button className="timer-btn--secondary" onClick={handleComplete}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4"/>
                <line x1="19" y1="5" x2="19" y2="19"/>
              </svg>
            </button>

          </div>

          {/* Session dots */}
          <div className="timer-sessions">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`timer-sessions__dot ${i < (completedSessions % 4) ? 'completed' : ''}`}
              />
            ))}
            <span className="timer-sessions__label">
              {completedSessions % 4}/4 sessions
            </span>
          </div>

        </div>

        {/* ── Right: Side Panel ── */}
        <div className="timer-panel">

          {/* Task selector */}
          <div className="timer-task-card">
            <p className="timer-task-card__title">Focusing on</p>
            <select
              className="timer-task-select"
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
            >
              <option value="">No specific task</option>
              {tasks
                .filter(t => t.status !== 'done')
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))
              }
            </select>
          </div>

          {/* Stats */}
          <div className="timer-stats-card">
            <p className="timer-stats-card__title">Today</p>
            <div className="timer-stats-grid">
              <div className="timer-stat">
                <p className="timer-stat__label">Sessions</p>
                <p className="timer-stat__value">{completedSessions}</p>
              </div>
              <div className="timer-stat">
                <p className="timer-stat__label">Focus time</p>
                <p className="timer-stat__value">{totalFocusMins}m</p>
              </div>
            </div>
          </div>

          {/* Session log */}
          <div className="timer-log-card">
            <p className="timer-log-card__title">Session Log</p>
            {sessionsToday.length === 0 ? (
              <p className="timer-log-empty">No sessions yet today</p>
            ) : (
              sessionsToday.map((s, i) => {
                const task = tasks.find(t => t.id === s.task_id)
                return (
                  <div key={i} className="timer-log-item">
                    <span className="timer-log-item__task">
                      {task ? task.title : 'General focus'}
                    </span>
                    <span className="timer-log-item__duration">
                      {s.duration_mins} min
                    </span>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Timer