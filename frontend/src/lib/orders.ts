import { api } from './client'

export type OrderItem = {
  product: string
  quantity: number
  price: number
}

export type DeliveryAddress = {
  street: string
  city: string
  postalCode: string
  phone: string
}

export type Order = {
  _id: string
  user: string
  items: Array<{
    product: {
      _id: string
      name: string
      images: string[]
      price: number
      description?: string
    }
    quantity: number
    price: number
  }>
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  deliveryAddress: DeliveryAddress
  paymentMethod: 'cash' | 'card' | 'online'
  notes?: string
  createdAt: string
  updatedAt: string
}

export type CreateOrderPayload = {
  items: Array<{
    product: string
    quantity: number
  }>
  deliveryAddress: DeliveryAddress
  paymentMethod?: 'cash' | 'card' | 'online'
  notes?: string
  totalAmount?: number
}

export type OrderListResponse = {
  orders: Order[]
  totalPages: number
  currentPage: number
  total: number
}

// Create new order
export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await api.post('/api/orders', payload)
  return data
}

// Get user's orders
export async function getUserOrders(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  const { data } = await api.get('/api/orders/my-orders', { params })
  return data
}

// Get order by ID
export async function getOrderById(id: string) {
  const { data } = await api.get(`/api/orders/${id}`)
  return data
}

// Cancel order
export async function cancelOrder(id: string) {
  const { data } = await api.patch(`/api/orders/${id}/cancel`)
  return data
}

// Get all orders (admin only)
export async function getAllOrders(params?: {
  page?: number
  limit?: number
  status?: string
  user?: string
}) {
  const { data } = await api.get('/api/orders', { params })
  return data
}

// Update order status (admin only)
export async function updateOrderStatus(id: string, status: string) {
  const { data } = await api.patch(`/api/orders/${id}/status`, { status })
  return data
}

// Admin cancel order (changes status, doesn't delete)
export async function adminCancelOrder(id: string) {
  const { data } = await api.patch(`/api/orders/${id}/admin-cancel`)
  return data
}
