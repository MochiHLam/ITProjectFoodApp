import { Link as RouterLink } from 'react-router-dom'
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Card, 
  CardContent, 
  Stack,
  Paper,
  Avatar
} from '@mui/material'
import { 
  Restaurant as RestaurantIcon,
  DeliveryDining as DeliveryIcon,
  Star as StarIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

// Home page with hero section, features showcase, and call-to-action
export default function Home() {
  const { token, user } = useAuth()

  // Feature cards data for showcase section
  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Fresh Food',
      description: 'Delicious meals prepared with fresh ingredients daily',
      color: '#4CAF50'
    },
    {
      icon: <DeliveryIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep',
      color: '#FF9800'
    },
    {
      icon: <StarIcon sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Quality Service',
      description: 'Top-rated food delivery service in your area',
      color: '#9C27B0'
    }
  ]


  return (
    <Box>
      {/* Hero Section - Main landing area with gradient background and action buttons */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            backgroundSize: '100% 100%'
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Welcome to Food Delivery
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 6, 
              opacity: 0.95,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              fontWeight: 300
            }}
          >
            Order your favorite meals and get them delivered fast!
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center" 
            alignItems="center"
            sx={{ mb: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/products"
              startIcon={<RestaurantIcon />}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.3s ease'
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
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': { 
                    borderColor: 'white', 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                My Cart
              </Button>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Features Section - Showcase of service benefits with animated cards */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom
            fontWeight="bold"
            sx={{ 
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 2,
              color: 'text.primary'
            }}
          >
            Why Choose Us?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 400
            }}
          >
            We provide exceptional food delivery service with the highest quality standards
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 4,
          justifyContent: 'center'
        }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ 
              flex: '1 1 300px', 
              maxWidth: '400px',
              minWidth: '300px'
            }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  p: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': { 
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${feature.color} 0%, ${feature.color}80 100%)`
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: `${feature.color}15`,
                      border: `2px solid ${feature.color}30`
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography 
                    variant="h4" 
                    component="h3" 
                    gutterBottom
                    fontWeight="bold"
                    sx={{ 
                      mb: 2,
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                      color: 'text.primary'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.6,
                      fontWeight: 400
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Call to Action - Ordering prompt section (hidden for admin users) */}
      {user?.role !== 'admin' && (
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            py: 10,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(25, 118, 210, 0.05) 0%, transparent 50%)',
              backgroundSize: '100% 100%'
            }}
          />
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <Typography 
                variant="h2" 
                component="h2" 
                gutterBottom
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  mb: 2,
                  color: 'text.primary'
                }}
              >
                Ready to Order?
              </Typography>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 400,
                  lineHeight: 1.5
                }}
              >
                Discover our delicious menu and place your order today!
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={RouterLink}
                  to="/products"
                  startIcon={<RestaurantIcon />}
                  sx={{ 
                    px: 5, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start Ordering
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      )}

    </Box>
  )
}

