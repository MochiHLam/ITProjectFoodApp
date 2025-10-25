import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../api/products'
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
  Divider
} from '@mui/material'
import { ArrowBack as ArrowBackIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material'

// Product edit page for admin with image upload functionality
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
  
  // Image upload states
  const [images, setImages] = React.useState<FileList | null>(null)

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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files)
    }
  }

  // Handle form submission with images
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      
      if (!name.trim()) throw new Error('Name is required')
      if (Number.isNaN(price) || price < 0) throw new Error('Price must be a non-negative number')
      
      console.log('Submitting form with images:', images)
      
      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('price', String(price))
      if (description.trim()) formData.append('description', description.trim())
      
      // Add new images if any
      if (images && images.length > 0) {
        console.log('Adding images to FormData:', Array.from(images).map(f => f.name))
        Array.from(images).forEach((file) => {
          formData.append('images', file)
        })
      }
      
      // Update product with FormData
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000'
      console.log('Sending request to:', `${API_URL}/api/products/${id}`)
      
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to update product: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Update result:', result)
      
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

            <Divider sx={{ my: 2 }} />

            {/* Image Upload Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Images
              </Typography>
              
              {/* Current Images */}
              {product?.images && product.images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Images:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {product.images.map((image: string, index: number) => (
                      <Card key={index} sx={{ width: 100, height: 100 }}>
                        <CardMedia
                          component="img"
                          height="100"
                          image={image}
                          alt={`Product image ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* File Input - Simple like ProductForm */}
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                Upload Images
                <input 
                  hidden 
                  name="images" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </Button>
              
              {images && images.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {images.length} file(s) selected
                </Typography>
              )}
            </Box>

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
