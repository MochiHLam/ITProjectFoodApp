import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Stack, 
  Card, 
  CardContent, 
  CardMedia,
  IconButton,
  TextField,
  Divider
} from '@mui/material'
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material'
import { useCart } from '../contexts/CartContext'

export default function Cart() {
  const navigate = useNavigate()
  const { state, dispatch } = useCart()

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })
  }

  const handleRemoveItem = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
  }

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (state.items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add some delicious food to get started!
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/products')}
        >
          Browse Menu
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Shopping Cart
      </Typography>

      <Stack spacing={3}>
        {state.items.map((item) => (
          <Card key={item.product._id} sx={{ display: 'flex' }}>
            <CardMedia
              component="img"
              sx={{ width: 150, height: 150 }}
              image={item.product.images?.[0] ? `http://localhost:4000${item.product.images[0]}` : '/placeholder-food.jpg'}
              alt={item.product.name}
            />
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {item.product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.product.description}
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  ${item.product.price.toLocaleString()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1
                      handleUpdateQuantity(item.product._id, newQuantity)
                    }}
                    inputProps={{ 
                      min: 1, 
                      style: { textAlign: 'center', width: '60px' } 
                    }}
                    size="small"
                    type="number"
                  />
                  <IconButton 
                    size="small" 
                    onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                  >
                    <AddIcon />
                  </IconButton>
                </Stack>
                
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6" fontWeight="bold">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </Typography>
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveItem(item.product._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total Items:</Typography>
            <Typography variant="h6" fontWeight="bold">{state.totalItems}</Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold">Total Amount:</Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              ${state.totalAmount.toLocaleString()}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
              sx={{ flex: 1 }}
            >
              Continue Shopping
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCheckout}
              sx={{ flex: 1 }}
              size="large"
            >
              Proceed to Checkout
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}
