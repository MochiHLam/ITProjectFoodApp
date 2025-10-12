import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket'
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Card, 
  CardContent, 
  Stack
} from '@mui/material'
import { 
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryIcon,
  Star as StarIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const socketRef = useSocket()
  const { token } = useAuth()
  const [message, setMessage] = React.useState<string>('')
  
  React.useEffect(() => {
    const s = socketRef.current
    if (!s) return
    s.on('welcome', (data: any) => setMessage(data.message))
    return () => {
      s.off('welcome')
    }
  }, [socketRef])

  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fresh Food',
      description: 'Delicious meals prepared with fresh ingredients daily'
    },
    {
      icon: <DeliveryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep'
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Quality Service',
      description: 'Top-rated food delivery service in your area'
    }
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to Food Delivery
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Order your favorite meals and get them delivered fast!
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/products"
              startIcon={<RestaurantIcon />}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Browse Menu
            </Button>
            {token && (
              <Button
                variant="outlined"
                size="large"
                component={RouterLink}
                to="/cart"
                startIcon={<CartIcon />}
                sx={{ 
                  borderColor: 'white', 
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                My Cart
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mt: 2 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  p: 3,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Call to Action */}
      <Box 
        sx={{ 
          bgcolor: 'grey.50', 
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Order?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Discover our delicious menu and place your order today!
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/products"
            startIcon={<RestaurantIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Start Ordering
          </Button>
        </Container>
      </Box>

      {/* Real-time Status (for development) */}
      {import.meta.env.DEV && (
        <Box sx={{ p: 2, bgcolor: 'info.light', textAlign: 'center' }}>
          <Typography variant="body2" color="info.contrastText">
            🔗 Real-time Status: {message || 'connecting...'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}


