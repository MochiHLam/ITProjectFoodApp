import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, updateProduct } from '../api/products'
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack,
  IconButton,
  CircularProgress
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Form states
  const [name, setName] = React.useState('')
  const [price, setPrice] = React.useState<number>(0)
  const [description, setDescription] = React.useState('')

  React.useEffect(() => {
    if (!id) return
    
    async function loadProduct() {
      try {
        setLoading(true)
        const data = await getProduct(id!)
        setProduct(data)
        setName(data.name)
        setPrice(data.price)
        setDescription(data.description || '')
      } catch (err: any) {
        setError(err?.message || 'Failed to load food item')
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      
      if (!name.trim()) throw new Error('Name is required')
      if (Number.isNaN(price) || price < 0) throw new Error('Price must be a non-negative number')
      
      await updateProduct(id!, {
        name: name.trim(),
        price,
        description: description.trim() || undefined
      })
      
      navigate(`/products/${id}`)
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err?.response?.data?.message || err?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading food item...</Typography>
      </Box>
    )
  }

  if (error && !product) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/products')}>
          Back to Menu
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(`/products/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold">
          Edit Food Item
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
          <Stack spacing={3}>
            <TextField
              label="Food Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Price"
              type="number"
              value={Number.isNaN(price) ? '' : price}
              onChange={(e) => setPrice(e.target.value === '' ? NaN : Number(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              placeholder="Describe this food item..."
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{ minWidth: 120 }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate(`/products/${id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
