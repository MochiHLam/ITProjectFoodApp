import React from 'react'
import { useNavigate } from 'react-router-dom'
import { register as registerApi } from '../api/auth'
import { TextField, Button, Box, Typography, Paper, Divider, Stack } from '@mui/material'
import { Google, GitHub, Facebook } from '@mui/icons-material'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const API = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000'
  const [providers, setProviders] = React.useState<{ google?: boolean; github?: boolean; facebook?: boolean }>({})

  React.useEffect(() => {
    // Fetch which OAuth providers are enabled on the backend
    fetch(`${API}/api/auth/providers`)
      .then((r) => r.json())
      .then((data) => setProviders(data || {}))
      .catch(() => setProviders({}))
  }, [API])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await registerApi({ name, email, password })
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Register failed')
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h5" gutterBottom>Register</Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button variant="contained" type="submit">Register</Button>
          <Divider sx={{ my: 1 }}>OR</Divider>
          <Stack direction="row" spacing={1} justifyContent="center">
            {providers.google && (
              <Button variant="outlined" startIcon={<Google />} onClick={() => { window.location.href = `${API}/api/auth/google` }} color="error">
                Google
              </Button>
            )}
            {providers.github && (
              <Button variant="outlined" startIcon={<GitHub />} onClick={() => { window.location.href = `${API}/api/auth/github` }} color="inherit">
                GitHub
              </Button>
            )}
            {providers.facebook && (
              <Button variant="outlined" startIcon={<Facebook />} onClick={() => { window.location.href = `${API}/api/auth/facebook` }} color="primary">
                Facebook
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}


