import '../styles/TaskCard.css'
import { PRIORITY_META, STATUS_META } from '../constants/taskConfig'

function TaskCard({ task, onEdit, onDelete, onToggleDone }) {

  const isOverdue = task.status !== 'done' && task.due_date && new Date(task.due_date) < new Date()
  const isDone    = task.status === 'done'
  const priority  = PRIORITY_META[task.priority] || PRIORITY_META['medium']
  const status    = STATUS_META[task.status]     || STATUS_META['todo']

  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : 'No due date'

  return (
    <div
      className={`task-card ${isDone ? 'done' : ''}`}
      style={{ borderLeft: `3px solid ${priority.dot}` }}
    >

      {/* Top row */}
      <div className="task-card__top">

        <button
          className={`task-card__checkbox ${isDone ? 'checked' : ''}`}
          onClick={() => onToggleDone(task.id)}
        >
          {isDone && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4L3.5 6.5L9 1"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <span className={`task-card__title ${isDone ? 'done' : ''}`}>
          {task.title}
        </span>

        <div className="task-card__actions">
          <button
            className="task-card__btn task-card__btn--edit"
            onClick={() => onEdit(task)}
          >
            ✏️
          </button>
          <button
            className="task-card__btn task-card__btn--delete"
            onClick={() => onDelete(task.id)}
          >
            🗑️
          </button>
        </div>

      </div>

      {/* Notes */}
      {task.notes && (
        <p className="task-card__description">{task.notes}</p>
      )}

      {/* Footer */}
      <div className="task-card__footer">

        <span
          className="pill"
          style={{ background: priority.bg, color: priority.txt }}
        >
          <span className="pill__dot" style={{ background: priority.dot }} />
          {priority.label}
        </span>

        <span
          className="pill"
          style={{ background: status.bg, color: status.txt }}
        >
          {status.label}
        </span>

        <span
          className="pill"
          style={{ background: '#EDE8D8', color: '#4A5640' }}
        >
          {task.category}
        </span>

        <span className={`task-card__due ${isOverdue ? 'overdue' : ''}`}>
          {isOverdue ? 'Overdue · ' : ''}{formattedDate}
        </span>

      </div>
    </div>
  )
}

export default TaskCard