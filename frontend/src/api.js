import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Tasks ──
export const fetchTasks = () =>
  api.get('/tasks').then(res => res.data)

export const createTask = (taskData) =>
  api.post('/tasks', taskData).then(res => res.data)

export const updateTask = (id, taskData) =>
  api.put(`/tasks/${id}`, taskData).then(res => res.data)

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`).then(res => res.data)

export default api