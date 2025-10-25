import { Link as RouterLink } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Button, Stack, Chip, Badge } from '@mui/material'
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../contexts/CartContext'

// Navigation bar with role-based menu items and cart badge
export default function NavBar() {
  const { token, user, setToken } = useAuth()
  const { state: cartState } = useCart()

  // Logout function that clears token and redirects to login
  function logout() {
    setToken(null)
    window.location.href = '/login'
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* App logo/brand */}
        <Typography variant="h6" component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none' }}>
          Food Delivery
        </Typography>
        
        {/* Navigation menu with role-based items */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button color="inherit" component={RouterLink} to="/products">Menu</Button>
          {token ? (
            <>
              {/* Cart button - hidden for admin users */}
              {user?.role !== 'admin' && (
                <Badge badgeContent={cartState.totalItems} color="error">
                  <Button color="inherit" component={RouterLink} to="/cart" startIcon={<ShoppingCartIcon />}>
                    Cart
                  </Button>
                </Badge>
              )}
              
              {/* Orders button - different text for admin vs user */}
              <Button color="inherit" component={RouterLink} to="/orders">
                {user?.role === 'admin' ? "USER'S ORDERS" : "My Orders"}
              </Button>
              
              {/* Admin-only menu items */}
              {user?.role === 'admin' && (
                <>
                  <Button color="inherit" component={RouterLink} to="/products/new">Add Food</Button>
                  <Button color="inherit" component={RouterLink} to="/users">Manage Users</Button>
                </>
              )}
              
              {/* User role indicator */}
              <Chip 
                label={user?.role === 'admin' ? 'Admin' : 'User'} 
                color={user?.role === 'admin' ? 'error' : 'default'}
                size="small"
                sx={{ color: 'white' }}
              />
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              {/* Guest menu items */}
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}


