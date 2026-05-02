import { useState } from 'react'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import '../styles/Tasks.css'
import { SEED_TASKS } from '../constants/taskConfig'

let nextId = SEED_TASKS.length + 1

function Tasks() {
  const [tasks, setTasks]       = useState(SEED_TASKS)
  const [search, setSearch]     = useState('')
  const [filterP, setFilterP]   = useState('all')
  const [filterS, setFilterS]   = useState('all')
  const [modal, setModal]       = useState(null)

  // ── Stats ──
  const total   = tasks.length
  const done    = tasks.filter(t => t.status === 'done').length
  const inProg  = tasks.filter(t => t.status === 'in_progress').length
  const overdue = tasks.filter(t => t.status !== 'done' && new Date(t.due) < new Date()).length
  const pct     = Math.round((done / total) * 100) || 0

  // ── Filtered and sorted list ──
  const visible = tasks
    .filter(t => {
      if (filterP !== 'all' && t.priority !== filterP) return false
      if (filterS !== 'all' && t.status   !== filterS) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => new Date(a.due) - new Date(b.due))

  // ── CRUD functions ──
  const handleSave = (form) => {
    if (form.id) {
      setTasks(prev => prev.map(t => t.id === form.id ? form : t))
    } else {
      setTasks(prev => [...prev, { ...form, id: nextId++ }])
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleToggleDone = (id) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
        : t
    ))
  }

  return (
    <div className="tasks-page">

      {/* ── Header ── */}
      <div className="tasks-header">
        <div className="tasks-header__top">
          <div>
            <p className="tasks-header__label">FocusFlow</p>
            <h1 className="tasks-header__title">Task Manager</h1>
          </div>
          <button
            className="tasks-header__btn"
            onClick={() => setModal('new')}
          >
            + New Task
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="tasks-stats">
          <div className="tasks-stats__item">
            <p className="tasks-stats__label">Total</p>
            <p className="tasks-stats__value" style={{ color: '#1A2610' }}>{total}</p>
          </div>
          <div className="tasks-stats__item">
            <p className="tasks-stats__label">In Progress</p>
            <p className="tasks-stats__value" style={{ color: '#5C7A28' }}>{inProg}</p>
          </div>
          <div className="tasks-stats__item">
            <p className="tasks-stats__label">Completed</p>
            <p className="tasks-stats__value" style={{ color: '#7A9A48' }}>{done}</p>
          </div>
          <div className="tasks-stats__item">
            <p className="tasks-stats__label">Overdue</p>
            <p className="tasks-stats__value" style={{ color: '#C84020' }}>{overdue}</p>
          </div>
          <div className="tasks-stats__item tasks-stats__item--last">
            <div className="tasks-progress__top">
              <span className="tasks-progress__label">Progress</span>
              <span className="tasks-progress__pct">{pct}%</span>
            </div>
            <div className="tasks-progress__bar">
              <div
                className="tasks-progress__fill"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="tasks-filters">
        <div className="tasks-filters__search-wrap">
          <span className="tasks-filters__search-icon">
            🔍
          </span>
          <input
            className="tasks-filters__search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
          />
        </div>

        <select
          className="tasks-filters__select"
          value={filterP}
          onChange={e => setFilterP(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="tasks-filters__select"
          value={filterS}
          onChange={e => setFilterS(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <span className="tasks-filters__count">
          {visible.length} task{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Task List ── */}
      {visible.length === 0 ? (
        <div className="tasks-empty">
          <p className="tasks-empty__title">No tasks found</p>
          <p className="tasks-empty__subtitle">Adjust your filters or add a new task.</p>
        </div>
      ) : (
        <div className="tasks-list">
          {visible.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={t => setModal(t)}
              onDelete={handleDelete}
              onToggleDone={handleToggleDone}
            />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

    </div>
  )
}

export default Tasks