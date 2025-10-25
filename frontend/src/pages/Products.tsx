import React from 'react'
import { listProducts, deleteProduct } from '../api/products'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Paper, Stack, Typography, Card, CardContent, CardMedia, Alert } from '@mui/material'
import { Delete as DeleteIcon, Login as LoginIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

// Products page with search functionality and product grid display
export default function Products() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [q, setQ] = React.useState('') // Search query
  const [page, setPage] = React.useState(1)
  const [items, setItems] = React.useState<any[]>([])
  const [total, setTotal] = React.useState(0)
  const limit = 10

  // Load products with current search query and pagination
  async function load() {
    const data = await listProducts({ q, page, limit, sortBy: 'createdAt', sort: 'desc' })
    setItems(data.items)
    setTotal(data.total)
  }

  // Load products on component mount and page change
  React.useEffect(() => {
    load()
  }, [page])

  async function onDelete(id: string) {
    if (!confirm('Delete?')) return
    await deleteProduct(id)
    load()
  }

  // Clear search and reload all products
  function clearAll() {
    setQ('')
    setPage(1)
    load()
  }

  // Handle search button click
  function handleSearch() {
    setPage(1)
    load()
  }

  return (
    <Box>
      {/* Login reminder for guests */}
      {!token && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              component={RouterLink} 
              to="/login"
              startIcon={<LoginIcon />}
            >
              Login to Order
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Want to place an order?</strong> Please login first to add items to your cart and checkout.
          </Typography>
        </Alert>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Food Menu</Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" component={RouterLink} to="/products/new" size="large">
            Add New Food
          </Button>
        )}
      </Stack>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <TextField 
              size="small" 
              placeholder="Search products..." 
              value={q} 
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 300 }}
            />
            <Button variant="outlined" onClick={handleSearch}>
              Search
            </Button>
          </Stack>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {q && (
              <Typography variant="body2" color="text.secondary">
                {items.length} result{items.length !== 1 ? 's' : ''} found
              </Typography>
            )}
            <Button 
              variant="text" 
              onClick={clearAll}
              sx={{ color: 'text.secondary' }}
              disabled={!q}
            >
              Clear All
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {q ? `No products found for "${q}"` : 'No products found'}
          </Typography>
          {q && (
            <Button variant="outlined" onClick={clearAll} sx={{ mt: 1 }}>
              Clear search and show all products
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          }, 
          gap: 3 
        }}>
          {items.map((p) => (
            <Box key={p._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(`/products/${p._id}`)}
              >
                {p.images && p.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:4000${p.images[0]}`}
                    alt={p.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}
                  >
                    <Typography variant="h6">No Image</Typography>
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap title={p.name}>
                    {p.name}
                  </Typography>
                  {p.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {p.description}
                    </Typography>
                  )}
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {p.price.toLocaleString()} VNĐ
                  </Typography>
                </CardContent>
                
                {user?.role === 'admin' && (
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(p._id)
                      }}
                      fullWidth
                      size="small"
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {items.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Button 
              variant="outlined" 
              disabled={page <= 1} 
              onClick={() => setPage((p) => p - 1)}
              size="small"
            >
              Previous
            </Button>
            <Typography variant="body1" fontWeight="medium">
              Page {page} of {Math.max(1, Math.ceil(total / limit))}
            </Typography>
            <Button 
              variant="outlined" 
              disabled={page >= Math.ceil(total / limit)} 
              onClick={() => setPage((p) => p + 1)}
              size="small"
            >
              Next
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  )
}


