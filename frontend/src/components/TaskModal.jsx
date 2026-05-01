import { useState } from 'react'
import '../styles/TaskModal.css'
import { PRIORITY_META, STATUS_META, CATEGORIES } from '../constants/taskConfig'

function TaskModal({ task, onClose, onSave }) {

  const isEditing = task !== null

  const [form, setForm] = useState({
    title:       isEditing ? task.title       : '',
    description: isEditing ? task.description : '',
    priority:    isEditing ? task.priority    : 'medium',
    status:      isEditing ? task.status      : 'todo',
    due:         isEditing ? task.due         : '',
    category:    isEditing ? task.category    : 'Frontend',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    if (!form.title.trim()) {
      alert('Please enter a title')
      return
    }
    if (!form.due) {
      alert('Please select a due date')
      return
    }
    onSave(form)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">

        {/* Title */}
        <h2 className="modal__title">
          {isEditing ? 'Edit Task' : 'New Task'}
        </h2>

        {/* Task Title Input */}
        <label className="modal__label">Title *</label>
        <input
          className="modal__input"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="What needs doing?"
        />

        {/* Description Input */}
        <label className="modal__label">Description</label>
        <textarea
          className="modal__input"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional notes…"
          rows={3}
        />

        {/* Priority and Status */}
        <div className="modal__row">
          <div>
            <label className="modal__label">Priority</label>
            <select
              className="modal__input"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {Object.keys(PRIORITY_META).map((key) => (
                <option key={key} value={key}>
                  {PRIORITY_META[key].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="modal__label">Status</label>
            <select
              className="modal__input"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {Object.keys(STATUS_META).map((key) => (
                <option key={key} value={key}>
                  {STATUS_META[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date and Category */}
        <div className="modal__row">
          <div>
            <label className="modal__label">Due Date *</label>
            <input
              className="modal__input"
              type="date"
              name="due"
              value={form.due}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="modal__label">Category</label>
            <select
              className="modal__input"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="modal__actions">
          <button className="modal__btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal__btn--save" onClick={handleSave}>
            {isEditing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default TaskModal