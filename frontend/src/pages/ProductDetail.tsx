import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getProduct, listProducts } from '../lib/products'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  TextField,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardActionArea,
  Skeleton
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Add as AddIcon, Login as LoginIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../contexts/CartContext'
import { isBusinessOpen } from '../hooks/useBusinessHours'
import ClosedDialog from '../components/ClosedDialog'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token } = useAuth()
  const { dispatch } = useCart()
  const [product, setProduct] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const [snackbarOpen, setSnackbarOpen] = React.useState(false)
  const [closedDialogOpen, setClosedDialogOpen] = React.useState(false)
  const [suggested, setSuggested] = React.useState<any[]>([])
  const [suggestLoading, setSuggestLoading] = React.useState(false)
  const navigationState = location.state as { page?: number; q?: string } | null

  React.useEffect(() => {
    if (!id) return

    async function loadProduct() {
      try {
        setLoading(true)
        const data = await getProduct(id!)
        setProduct(data)
      } catch (err: any) {
        setError(err?.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  // Load suggested products khi đã có product data
  React.useEffect(() => {
    if (!product?.tags?.length) {
      setSuggested([])
      return
    }
    async function loadSuggested() {
      setSuggestLoading(true)
      try {
        // Tìm theo tag đầu tiên
        const tag = product.tags[0]
        const data = await listProducts({ q: tag, limit: 5 })
        // Loại bỏ bản thân, lấy tối đa 4
        const filtered = (data.items || []).filter((p: any) => p._id !== product._id).slice(0, 4)
        setSuggested(filtered)
      } catch {
        setSuggested([])
      } finally {
        setSuggestLoading(false)
      }
    }
    loadSuggested()
  }, [product])


  const handleAddToCart = () => {
    if (!product) return

    // Redirect to login if not authenticated
    if (!token) {
      navigate('/login')
      return
    }

    // Kiểm tra giờ làm việc
    if (!isBusinessOpen()) {
      setClosedDialogOpen(true)
      return
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product: {
          _id: product._id,
          name: product.name,
          images: product.images || [],
          price: product.price,
          description: product.description
        },
        quantity: quantity
      }
    })

    // Show success message
    setSnackbarOpen(true)

    // Reset quantity
    setQuantity(1)
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  const handleBack = () => {
    if (navigationState?.page || navigationState?.q) {
      navigate('/products', {
        state: {
          page: navigationState?.page ?? 1,
          q: navigationState?.q ?? ''
        }
      })
      return
    }

    navigate('/products')
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error || 'Food item not found'}
        </Typography>
        <Button variant="outlined" onClick={handleBack}>
          Back to Menu
        </Button>
      </Box>
    )
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
              onClick={() => navigate('/login')}
              startIcon={<LoginIcon />}
            >
              Login to Order
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>Want to add this item to cart?</strong> Please login first to add items and place orders.
          </Typography>
        </Alert>
      )}

      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Food Details
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Product Images */}
          <Box sx={{ flex: 1 }}>
            {product.images && product.images.length > 0 ? (
              <CardMedia
                component="img"
                height="400"
                image={product.images[0]}
                alt={product.name}
                sx={{
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 2
                }}
              />
            ) : (
              <Box
                sx={{
                  height: 400,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  borderRadius: 2,
                  mb: 2
                }}
              >
                <Typography variant="h6">No Image</Typography>
              </Box>
            )}

            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
                {product.images.slice(1).map((img: string, index: number) => (
                  <CardMedia
                    key={index}
                    component="img"
                    height="80"
                    image={img}
                    alt={`${product.name} ${index + 2}`}
                    sx={{
                      objectFit: 'cover',
                      borderRadius: 1,
                      minWidth: 80
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Product Info */}
          <Box sx={{ flex: 1 }}>
            <Stack spacing={2}>
              <Typography variant="h3" fontWeight="bold">
                {product.name}
              </Typography>

              <Typography variant="h4" color="primary" fontWeight="bold">
                {product.price.toLocaleString()} VNĐ
              </Typography>

              {/* Add to Cart Section - Hidden for Admin */}
              {user?.role !== 'admin' && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Add to Cart
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1 }}
                        size="small"
                        sx={{ width: 100 }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddToCart}
                        size="large"
                        disabled={!token}
                      >
                        {token ? 'Add to Cart' : 'Login to Add'}
                      </Button>
                    </Stack>
                  </Box>
                </>
              )}

              {product.description && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {product.description}
                    </Typography>
                  </Box>
                </>
              )}

              <Divider />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                {product.tags && product.tags.length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {product.tags.map((tag: string, index: number) => (
                      <Chip key={index} label={tag} size="small" color="primary" variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No tags available
                  </Typography>
                )}
              </Box>

              {/* Food Information - Only visible for Admin */}
              {user?.role === 'admin' && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Food Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Added to Menu:</strong> {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Food ID:</strong> {product._id}
                      </Typography>
                    </Stack>
                  </Box>
                </>
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                {user?.role === 'admin' && (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/products/${product._id}/edit`)}
                  >
                    Edit Food Item
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={handleBack}
                >
                  Back to Menu
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Suggested Products */}
      {(suggestLoading || suggested.length > 0) && (
        <Box sx={{ mt: 5 }}>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
            Suggestions
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)'
              },
              gap: 2
            }}
          >
            {suggestLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} sx={{ borderRadius: 2 }}>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton width="80%" />
                    <Skeleton width="50%" />
                  </CardContent>
                </Card>
              ))
              : suggested.map((p) => (
                <Card
                  key={p._id}
                  sx={{
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                  }}
                >
                  <CardActionArea onClick={() => navigate(`/products/${p._id}`)}>
                    {p.images?.[0] ? (
                      <CardMedia
                        component="img"
                        height="160"
                        image={p.images[0]}
                        alt={p.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 160,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">No Image</Typography>
                      </Box>
                    )}
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Typography variant="subtitle1" fontWeight="bold" noWrap title={p.name}>
                        {p.name}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {p.price.toLocaleString()} VNĐ
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
          </Box>
        </Box>
      )}

      <ClosedDialog open={closedDialogOpen} onClose={() => setClosedDialogOpen(false)} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          {product?.name} has been added to your cart!
        </Alert>
      </Snackbar>
    </Box>
  )
}
