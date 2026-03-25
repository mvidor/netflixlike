import { createContext, useEffect, useState } from 'react'
import {
  authAPI,
  clearAuth,
  getUser,
  isAuthenticated as hasAuthToken,
  saveAuth
} from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getUser()

      if (!hasAuthToken()) {
        setUser(storedUser)
        setLoading(false)
        return
      }

      try {
        const response = await authAPI.getMe()
        setUser(response.user)
        saveAuth(localStorage.getItem('token'), response.user)
      } catch {
        clearAuth()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      saveAuth(response.token, response.user)
      setUser(response.user)
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register({ name, email, password })
      saveAuth(response.token, response.user)
      setUser(response.user)
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      if (hasAuthToken()) {
        await authAPI.logout()
      }
    } catch {
      // La suppression locale suffit si le token est deja invalide
    } finally {
      clearAuth()
      setUser(null)
    }
  }

  const isAuthenticated = () => hasAuthToken()

  const updateProfile = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates)
      const currentToken = localStorage.getItem('token')
      saveAuth(currentToken, response.user)
      setUser(response.user)
      return { success: true, user: response.user, message: response.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (passwords) => {
    try {
      const response = await authAPI.changePassword(passwords)
      return { success: true, message: response.message }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe()
      const currentToken = localStorage.getItem('token')
      saveAuth(currentToken, response.user)
      setUser(response.user)
      return response.user
    } catch {
      return null
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    updateProfile,
    changePassword,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export { AuthContext }
