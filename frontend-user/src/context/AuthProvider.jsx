import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USER_STORAGE_KEY = 'user'
const USERS_STORAGE_KEY = 'users'

const readJson = (key, fallback) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const buildAvatarUrl = (nameOrEmail) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOrEmail)}&background=e50914&color=fff`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = readJson(USER_STORAGE_KEY, null)

    if (storedUser && typeof storedUser.email === 'string') {
      const normalizedUser = {
        ...storedUser,
        name: storedUser.name || storedUser.email.split('@')[0],
        avatar:
          storedUser.avatar || buildAvatarUrl(storedUser.name || storedUser.email)
      }
      setUser(normalizedUser)
      saveJson(USER_STORAGE_KEY, normalizedUser)
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const users = readJson(USERS_STORAGE_KEY, [])
      const matchedUser = users.find(
        (item) => item.email.toLowerCase() === email.toLowerCase()
      )

      if (!matchedUser || matchedUser.password !== password) {
        return { success: false, error: 'Email ou mot de passe incorrect' }
      }

      const nextUser = {
        id: matchedUser.id ?? Date.now(),
        email: matchedUser.email,
        name: matchedUser.name || matchedUser.email.split('@')[0],
        avatar: matchedUser.avatar || buildAvatarUrl(matchedUser.name || matchedUser.email)
      }

      setUser(nextUser)
      saveJson(USER_STORAGE_KEY, nextUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const users = readJson(USERS_STORAGE_KEY, [])
      const alreadyExists = users.some(
        (item) => item.email.toLowerCase() === email.toLowerCase()
      )

      if (alreadyExists) {
        return { success: false, error: 'Cet email existe deja' }
      }

      const createdUser = {
        id: Date.now(),
        name,
        email,
        password,
        avatar: buildAvatarUrl(name || email)
      }

      saveJson(USERS_STORAGE_KEY, [...users, createdUser])

      const sessionUser = {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        avatar: createdUser.avatar
      }

      setUser(sessionUser)
      saveJson(USER_STORAGE_KEY, sessionUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const isAuthenticated = () => user !== null

  const updateProfile = (updates) => {
    if (!user) {
      return
    }

    const updatedUser = {
      ...user,
      ...updates
    }

    setUser(updatedUser)
    saveJson(USER_STORAGE_KEY, updatedUser)

    const users = readJson(USERS_STORAGE_KEY, [])
    const updatedUsers = users.map((item) =>
      item.email.toLowerCase() === user.email.toLowerCase() ? { ...item, ...updates } : item
    )
    saveJson(USERS_STORAGE_KEY, updatedUsers)
  }

  const value = { user, loading, login, register, logout, isAuthenticated, updateProfile }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
