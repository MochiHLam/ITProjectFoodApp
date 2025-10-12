import { api } from './client'

export async function register(payload: { name?: string; email: string; password: string }) {
  const { data } = await api.post('/api/auth/register', payload)
  return data
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post('/api/auth/login', payload)
  return data
}

export async function me() {
  const { data } = await api.get('/api/auth/me')
  return data
}



