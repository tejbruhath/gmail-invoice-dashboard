import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import SettingsPage from './pages/SettingsPage'

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
axios.defaults.withCredentials = true

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await axios.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/" />} 
      />
      <Route 
        path="/settings" 
        element={user ? <SettingsPage user={user} setUser={setUser} /> : <Navigate to="/" />} 
      />
    </Routes>
  )
}

export default App
