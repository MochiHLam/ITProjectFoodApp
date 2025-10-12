import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Box, CircularProgress } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hash = window.location.hash || ''
    const params = new URLSearchParams(hash.replace(/^#/,''))
    const token = params.get('token')
    if (token) {
      // First set the token
      setToken(token)
      
      // Then fetch user data immediately to avoid redirect to login
      const fetchUserData = async () => {
        try {
          const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000'
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
            }
          }
           // Navigate after fetching user data
           setIsLoading(false)
           // Force page reload to ensure all components update
           window.location.href = '/products'
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          setIsLoading(false)
          navigate('/login', { replace: true })
        }
      }
      
      fetchUserData()
    } else {
      setIsLoading(false)
      navigate('/login', { replace: true })
    }
  }, [navigate, setToken])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: 2 }}>
      <CircularProgress />
      <Typography>
        {isLoading ? 'Signing you in...' : 'Redirecting to menu...'}
      </Typography>
    </Box>
  )
}


