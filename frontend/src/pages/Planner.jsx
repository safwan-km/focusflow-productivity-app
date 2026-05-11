import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/Toast'
import { fetchTasks, generatePlan } from '../api'
import '../styles/Planner.css'

function Planner() {
  const [tasks, setTasks]         = useState([])
  const [plan, setPlan]           = useState(null)
  const [loading, setLoading]     = useState(false)
  const [focusHours, setFocusHours] = useState(4)
  const [date, setDate]           = useState(
    new Date().toISOString().split('T')[0]
  )
  const { toasts, showToast, removeToast } = useToast()

  useEffect(() => {
    fetchTasks()
      .then(data => setTasks(data.filter(t => t.status !== 'done')))
      .catch(() => showToast('Failed to load tasks', 'error'))
  }, [])

  const handleGenerate = async () => {
    if (tasks.length === 0) {
      showToast('Add some tasks first before generating a plan!', 'info')
      return
    }
    setLoading(true)
    setPlan(null)
    try {
      const result = await generatePlan({
        date,
        focus_hours: parseInt(focusHours),
      })
      setPlan(result)
      showToast('Your plan is ready!', 'success')
    } catch (err) {
      showToast(
        err.response?.data?.detail || 'Failed to generate plan',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  const getPriorityClass = (priority) => {
    if (!priority) return 'planner-priority-pill--break'
    return `planner-priority-pill--${priority}`
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="planner-page">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="planner-header">
        <p className="planner-header__label">FocusFlow</p>
        <h1 className="planner-header__title">AI Planner</h1>
      </div>

      <div className="planner-layout">

        {/* ── Left: Controls ── */}
        <div className="planner-control-card">
          <h2 className="planner-control-card__title">Generate Your Plan</h2>

          {/* Date */}
          <label className="planner-label">Date</label>
          <input
            className="planner-input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {/* Focus Hours */}
          <label className="planner-label">Available Focus Hours</label>
          <select
            className="planner-input"
            value={focusHours}
            onChange={e => setFocusHours(e.target.value)}
          >
            <option value={2}>2 hours</option>
            <option value={3}>3 hours</option>
            <option value={4}>4 hours</option>
            <option value={5}>5 hours</option>
            <option value={6}>6 hours</option>
            <option value={8}>8 hours</option>
          </select>

          {/* Generate Button */}
          <button
            className="planner-generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Generate Plan'}
          </button>

          {/* Task count */}
          <p className="planner-task-count">
            {tasks.length} pending task{tasks.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* ── Right: Plan ── */}
        <div className="planner-right">

          {/* Loading */}
          {loading && (
            <div className="planner-loading">
              <div className="planner-loading__spinner" />
              <p className="planner-loading__text">
                AI is creating your personalized plan...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !plan && (
            <div className="planner-empty">
              <div className="planner-empty__icon">✨</div>
              <p className="planner-empty__title">
                Your AI plan will appear here
              </p>
              <p className="planner-empty__subtitle">
                Select your date and available hours,
                then click Generate Plan to get a
                personalized study schedule based on your tasks.
              </p>
            </div>
          )}

          {/* Plan result */}
          {!loading && plan && (
            <>
              {/* Plan header */}
              <div className="planner-result-header">
                <p className="planner-result-header__greeting">
                  {plan.greeting}
                </p>
                <p className="planner-result-header__date">
                  {formatDate(plan.date)}
                </p>
                <p className="planner-result-header__focus">
                  {plan.total_focus} of focused work planned
                </p>
              </div>

              {/* Plan items */}
              <div className="planner-items-card">
                {plan.plan.map((item, index) => (
                  <div
                    key={index}
                    className={`planner-item ${
                      item.priority === 'break' ? 'planner-item--break' : ''
                    }`}
                  >
                    {/* Time */}
                    <div className="planner-item__time">
                      {item.time}
                    </div>

                    {/* Content */}
                    <div className="planner-item__content">
                      <p className="planner-item__task">{item.task}</p>
                      {item.tip && (
                        <p className="planner-item__tip">{item.tip}</p>
                      )}
                    </div>

                    {/* Right side */}
                    <div className="planner-item__right">
                      <span className="planner-item__duration">
                        {item.duration}
                      </span>
                      <span className={`planner-priority-pill ${getPriorityClass(item.priority)}`}>
                        {item.priority || 'break'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivation */}
              {plan.motivation && (
                <div className="planner-motivation">
                  <p className="planner-motivation__label">
                    Coach says
                  </p>
                  <p className="planner-motivation__text">
                    "{plan.motivation}"
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default Planner