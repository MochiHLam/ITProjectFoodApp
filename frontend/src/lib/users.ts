import { api } from './client'

export type User = {
  _id: string
  name?: string
  email?: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: string
  oauthProvider?: string
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get('/api/users')
  return data
}

export async function getUser(id: string): Promise<User> {
  const { data } = await api.get(`/api/users/${id}`)
  return data
}

export async function updateUser(id: string, payload: Partial<Pick<User, 'role' | 'isActive'>>): Promise<User> {
  const { data } = await api.put(`/api/users/${id}`, payload)
  return data
}

export async function deleteUser(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/api/users/${id}`)
  return data
}





