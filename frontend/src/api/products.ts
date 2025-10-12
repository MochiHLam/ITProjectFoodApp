import { api } from './client'

export type Product = {
  _id?: string
  name: string
  description?: string
  price: number
  images?: string[]
  tags?: string[]
}

export async function listProducts(params: Record<string, any>) {
  const { data } = await api.get('/api/products', { params })
  return data
}

export async function getProduct(id: string) {
  const { data } = await api.get(`/api/products/${id}`)
  return data
}

export async function createProduct(formData: FormData) {
  const { data } = await api.post('/api/products', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const { data } = await api.put(`/api/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/api/products/${id}`)
  return data
}



