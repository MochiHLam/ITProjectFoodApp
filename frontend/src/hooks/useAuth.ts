import { useEffect, useState, useCallback } from 'react'
import { me } from '../lib/auth'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [isLoading, setIsLoading] = useState(true)

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      localStorage.removeItem('user')
      setIsLoading(false)
      return
    }
    
    try {
      const res = await me()
      setUser(res.user)
      localStorage.setItem('user', JSON.stringify(res.user))
    } catch (error: any) {
      // If user is deleted or deactivated, clear auth data
      if (error?.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
        // Force page reload to ensure all components update
        window.location.href = '/login'
      }
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    if (token && !user) {
      refreshUser()
    }
  }, [token, user, refreshUser])

  // Function to update token and refresh user
  const updateToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', newToken)
      setToken(newToken)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }

  // Function to set user data directly (for OAuth)
  const setUserData = (userData: any) => {
    setUser(userData)
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // Listen for storage changes to sync user data across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue))
        } else {
          setUser(null)
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return { 
    token, 
    setToken: updateToken, 
    user, 
    setUser: setUserData, 
    refreshUser,
    isLoading 
  }
}