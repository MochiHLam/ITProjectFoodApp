import React from 'react'
import { 
  Box, 
  Typography, 
  Button, 
  Stack, 
  Card, 
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
// Using text instead of icons to avoid dependency issues
// import { 
//   Restaurant as RestaurantIcon,
//   AccessTime as AccessTimeIcon,
//   CheckCircle as CheckCircleIcon,
//   Cancel as CancelIcon
// } from '@mui/icons-material'
import { getUserOrders, getAllOrders, cancelOrder, updateOrderStatus, type Order } from '../api/orders'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'

// Extend Order type for admin view
interface AdminOrder extends Omit<Order, 'user'> {
  user: {
    _id: string
    name: string
    email: string
  }
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

type StatusConfigType = {
  [K in OrderStatus]: {
    color: 'warning' | 'info' | 'primary' | 'secondary' | 'success' | 'error'
    label: string
    icon: React.ReactElement
  }
}

const statusConfig: StatusConfigType = {
  pending: { color: 'warning', label: 'Pending', icon: <span>⏰</span> },
  confirmed: { color: 'info', label: 'Confirmed', icon: <span>🍽️</span> },
  preparing: { color: 'primary', label: 'Preparing', icon: <span>👨‍🍳</span> },
  ready: { color: 'secondary', label: 'Ready', icon: <span>✅</span> },
  delivered: { color: 'success', label: 'Delivered', icon: <span>🚚</span> },
  cancelled: { color: 'error', label: 'Cancelled', icon: <span>❌</span> }
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = React.useState<(Order | AdminOrder)[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const socketRef = useSocket()

  const isAdmin = user?.role === 'admin'

  const loadOrders = async () => {
    try {
      setLoading(true)
      // Admin xem tất cả orders, User xem orders của mình
      const data = isAdmin 
        ? await getAllOrders({ page, limit: 10 })
        : await getUserOrders({ page, limit: 10 })
      setOrders(data.orders)
      setTotalPages(data.totalPages)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load orders'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadOrders()
  }, [page])

  // Realtime: refresh list when order events arrive
  React.useEffect(() => {
    const s = socketRef.current
    if (!s) return
    const onCreated = () => loadOrders()
    const onUpdated = () => loadOrders()
    const onCancelled = () => loadOrders()
    s.on('order:created', onCreated)
    s.on('order:updated', onUpdated)
    s.on('order:cancelled', onCancelled)
    return () => {
      s.off('order:created', onCreated)
      s.off('order:updated', onUpdated)
      s.off('order:cancelled', onCancelled)
    }
  }, [socketRef, page])

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    try {
      await cancelOrder(orderId)
      loadOrders() // Reload orders
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order'
      setError(errorMessage)
    }
  }

  const canCancelOrder = (status: OrderStatus) => {
    return ['pending', 'confirmed'].includes(status)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      loadOrders() // Reload orders
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ fontSize: 80, mb: 2 }}>🍽️</Typography>
        <Typography variant="h5" gutterBottom>
          No orders yet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start ordering some delicious food!
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          href="/products"
        >
          Browse Menu
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        {isAdmin ? 'All Orders (Admin)' : 'My Orders'}
      </Typography>

      <Stack spacing={3}>
        {orders.map((order: Order | AdminOrder) => (
          <Card key={order._id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </Typography>
                  {isAdmin && 'user' in order && typeof order.user === 'object' && (
                    <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                      Customer: {order.user.name || order.user.email}
                    </Typography>
                  )}
                </Box>
                <Box>
                  {isAdmin ? (
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={order.status}
                        label="Status"
                        onChange={(e: any) => handleUpdateStatus(order._id, e.target.value as OrderStatus)}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="preparing">Preparing</MenuItem>
                        <MenuItem value="ready">Ready</MenuItem>
                        <MenuItem value="delivered">Delivered</MenuItem>
<MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Chip
                      icon={statusConfig[order.status as OrderStatus].icon}
                      label={statusConfig[order.status as OrderStatus].label}
                      color={statusConfig[order.status as OrderStatus].color}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Order Items
                  </Typography>
                  <Stack spacing={1}>
                    {order.items.map((item: Order['items'][0], index: number) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.quantity} × ${item.price.toLocaleString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          ${(item.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ width: { xs: '100%', md: 300 } }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Delivery Info
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}<br />
                    Phone: {order.deliveryAddress.phone}
                  </Typography>
                  
                  {order.notes && (
                    <>
                      <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1 }}>
                        Special Instructions:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.notes}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Total: ${order.totalAmount.toLocaleString()}
</Typography>
                
                {!isAdmin && canCancelOrder(order.status) && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancelOrder(order._id)}
                    size="small"
                  >
                    Cancel Order
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              disabled={page <= 1}
              onClick={() => setPage((p: number) => p - 1)}
            >
              Previous
            </Button>
            <Typography variant="body1" sx={{ alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </Typography>
            <Button 
              variant="outlined" 
              disabled={page >= totalPages}
              onClick={() => setPage((p: number) => p + 1)}
            >
              Next
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )
}