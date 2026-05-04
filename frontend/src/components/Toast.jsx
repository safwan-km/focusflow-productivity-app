import { useState, useEffect } from 'react'
import '../styles/Toast.css'

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`toast toast--${type}`}>
      <span>
        {type === 'success' && '✅'}
        {type === 'error'   && '❌'}
        {type === 'info'    && 'ℹ️'}
      </span>
      <span>{message}</span>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}