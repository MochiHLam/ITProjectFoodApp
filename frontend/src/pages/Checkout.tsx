import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stack, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material'
import { useCart } from '../contexts/CartContext'
import { createOrder, type CreateOrderPayload } from '../api/orders'

export default function Checkout() {
  const navigate = useNavigate()
  const { state: cartState, clearCart } = useCart()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    street: '',
    city: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'online',
    notes: ''
  })

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.street || !formData.city || !formData.postalCode || !formData.phone) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const orderData: CreateOrderPayload = {
        items: cartState.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
        totalAmount: cartState.totalAmount
      }

      await createOrder(orderData)
      
      // Show success message
      setSnackbarOpen(true)
      
      // Clear cart after successful order
      clearCart()
      
      // Navigate to orders page after a short delay
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  if (cartState.items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Browse Menu
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Checkout
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Order Form */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Delivery Information
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Street Address"
                  value={formData.street}
                  onChange={handleInputChange('street')}
                  fullWidth
                  required
                />
                
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="City"
                    value={formData.city}
                    onChange={handleInputChange('city')}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Postal Code"
                    value={formData.postalCode}
                    onChange={handleInputChange('postalCode')}
                    fullWidth
                    required
                  />
                </Stack>
                
                <TextField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  fullWidth
                  required
                />
                
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      paymentMethod: e.target.value as 'cash' | 'card' | 'online' 
                    }))}
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash on Delivery</MenuItem>
                    <MenuItem value="card">Credit/Debit Card</MenuItem>
                    <MenuItem value="online">Online Payment</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Special Instructions (Optional)"
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Any special instructions for your order..."
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Place Order'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Order Summary */}
        <Box sx={{ width: { xs: '100%', md: 400 } }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Stack spacing={2} sx={{ mb: 3 }}>
              {cartState.items.map((item) => (
                <Box key={item.product._id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × {item.product.price.toLocaleString()} VNĐ
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    {(item.product.price * item.quantity).toLocaleString()} VNĐ
                  </Typography>
                </Box>
              ))}
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total Items:</Typography>
              <Typography variant="h6" fontWeight="bold">{cartState.totalItems}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight="bold">Total Amount:</Typography>
              <Typography variant="h5" color="primary" fontWeight="bold">
                {cartState.totalAmount.toLocaleString()} VNĐ
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Stack>
      
      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Đặt hàng thành công! Đang chuyển đến trang đơn hàng...
        </Alert>
      </Snackbar>
    </Box>
  )
}
