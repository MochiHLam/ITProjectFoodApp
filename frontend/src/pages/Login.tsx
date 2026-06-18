import React from 'react'
import { login, getProviders } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'
import { API_BASE_URL } from '../lib/client'
import { TextField, Button, Box, Typography, Paper, Divider, Stack } from '@mui/material'
import { Google, GitHub, Facebook } from '@mui/icons-material'

// Login page with email/password form and OAuth providers
export default function Login() {
  const { setToken, setUser } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [providers, setProviders] = React.useState<{ google?: boolean; github?: boolean; facebook?: boolean }>({})

  // Fetch available OAuth providers from backend
  React.useEffect(() => {
    getProviders().then(setProviders).catch(() => setProviders({}))
  }, [])

  // Handle email/password login form submission
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { token, user } = await login({ email, password })
      setToken(token)
      setUser(user)
      window.location.href = '/'
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        
        {/* Email/password login form */}
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button variant="contained" type="submit">Login</Button>
          
          <Divider sx={{ my: 1 }}>OR</Divider>
          
          {/* OAuth provider buttons */}
          <Stack direction="row" spacing={1} justifyContent="center">
            {providers.google && (
              <Button variant="outlined" startIcon={<Google />} onClick={() => { window.location.href = `${API_BASE_URL}/api/auth/google` }} color="error">
                Google
              </Button>
            )}
            {providers.github && (
              <Button variant="outlined" startIcon={<GitHub />} onClick={() => { window.location.href = `${API_BASE_URL}/api/auth/github` }} color="inherit">
                GitHub
              </Button>
            )}
            {providers.facebook && (
              <Button variant="outlined" startIcon={<Facebook />} onClick={() => { window.location.href = `${API_BASE_URL}/api/auth/facebook` }} color="primary">
                Facebook
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}


