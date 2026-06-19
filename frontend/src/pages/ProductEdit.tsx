import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, updateProductWithImages } from '../lib/products'
import { parseTags } from '../lib/utils'
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack,
  IconButton,
  CircularProgress,
  Divider,
  Chip
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
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState('')
  
  // Image upload states
  const [image, setImage] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

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
        setTags(data.tags || [])
      } catch (err: any) {
        setError(err?.message || 'Failed to load food item')
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
  }, [id])

  // Handle image file selection (single image only)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImage(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  // Handle form submission with images
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      
      if (!name.trim()) throw new Error('Name is required')
      if (Number.isNaN(price) || price < 0) throw new Error('Price must be a non-negative number')
      
      console.log('Submitting form with image:', image)
      
      // Process any pending tag input not yet confirmed with Enter
      if (tagInput.trim()) {
        setTags(parseTags(tagInput, tags))
        setTagInput('')
      }

      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('price', String(price))
      if (description.trim()) formData.append('description', description.trim())
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags))
      }
      
      // Add new image if selected (replaces old)
      if (image) {
        formData.append('images', image)
      }
      
      // Update product with FormData
      const result = await updateProductWithImages(id!, formData)
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

            {/* Tags Input */}
            <Box>
              <TextField
                label="Add Tags"
                placeholder="Enter tags separated by commas (e.g., phở, bò, truyền thống)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onBlur={() => {
                  if (tagInput.trim()) {
                    setTags(parseTags(tagInput, tags))
                    setTagInput('')
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    e.preventDefault()
                    setTags(parseTags(tagInput, tags))
                    setTagInput('')
                  }
                }}
                fullWidth
                size="small"
              />
              {tags.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => setTags(tags.filter((_, i) => i !== index))}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Enter tags separated by commas and press Enter to add (e.g., phở, bò, truyền thống)
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Image Upload Section */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Upload Image
              </Typography>
              
              {/* Current Image (chưa chọn ảnh mới) */}
              {!previewUrl && product?.images && product.images.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Current Image:
                  </Typography>
                  <Box
                    component="img"
                    src={product.images[0]}
                    alt="Current product image"
                    sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                  />
                </Box>
              )}

              {/* Preview ảnh mới chọn */}
              {previewUrl && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    New Image (will replace current):
                  </Typography>
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="New image preview"
                    sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid #1976d2' }}
                  />
                </Box>
              )}

              {/* File Input — chỉ 1 ảnh */}
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                Upload Image
                <input 
                  hidden 
                  name="images" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </Button>
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
