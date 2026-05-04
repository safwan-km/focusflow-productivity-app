import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.access_token)
    setToken(res.data.access_token)
    navigate('/dashboard')
  }

  const register = async (email, password) => {
    await api.post('/auth/register', { email, password })
    navigate('/login')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}