import React from 'react'
import { useNavigate } from 'react-router-dom'
import { createProduct } from '../api/products'
import { Box, Paper, Typography, TextField, Button, Chip, Stack } from '@mui/material'

export default function ProductForm() {
  const navigate = useNavigate()
  const [name, setName] = React.useState('')
  const [price, setPrice] = React.useState<number>(0)
  const [description, setDescription] = React.useState('')
  const [images, setImages] = React.useState<FileList | null>(null)
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Normalize and add tags from a raw input string (supports comma-separated or JSON-like strings)
  function addTagsFromInput(rawInput: string) {
    if (!rawInput) return
    // Remove wrapping brackets if user pasted JSON array, and quotes around items
    const sanitized = rawInput
      .replace(/^\s*\[/, '')
      .replace(/\]\s*$/, '')
    const splitTags = sanitized
      .split(',')
      .map(t => t.replace(/^\s*"|\s*"$/g, '').replace(/^\s*'|\s*'$/g, ''))
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0)
    if (splitTags.length === 0) return
    const unique = Array.from(new Set([...tags, ...splitTags]))
    setTags(unique)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)
      
      if (!name.trim()) throw new Error('Name is required')
      if (Number.isNaN(price) || price < 0) throw new Error('Price must be a non-negative number')
      
      // Process any pending tag input not yet confirmed with Enter
      if (tagInput.trim()) {
        addTagsFromInput(tagInput)
        setTagInput('')
      }

      const fd = new FormData()
      fd.append('name', name.trim())
      fd.append('price', String(price))
      if (description.trim()) fd.append('description', description.trim())
      if (tags.length > 0) {
        fd.append('tags', JSON.stringify(tags))
      }
      if (images) {
        Array.from(images).forEach((f) => fd.append('images', f))
      }
      
      await createProduct(fd)
      navigate('/products')
    } catch (err: any) {
      console.error('Create product error:', err)
      setError(err?.response?.data?.message || err?.message || 'Create failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper sx={{ p: 3, width: 480 }}>
        <Typography variant="h5" gutterBottom>New Product</Typography>
        <Box component="form" onSubmit={onSubmit} encType="multipart/form-data" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} fullWidth />
          <TextField label="Price" type="number" value={Number.isNaN(price) ? '' : price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value === '' ? NaN : Number(e.target.value))} fullWidth />
          <TextField label="Description" multiline minRows={3} value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} fullWidth />
          
          {/* Tags Input */}
          <Box>
            <TextField
              label="Add Tags"
              placeholder="Enter tags separated by commas (e.g., phở, bò, truyền thống)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={() => {
                if (tagInput.trim()) {
                  addTagsFromInput(tagInput)
                  setTagInput('')
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tagInput.trim()) {
                  e.preventDefault()
                  addTagsFromInput(tagInput)
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

          <Button variant="outlined" component="label">
            Upload Images
            <input hidden name="images" type="file" multiple accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImages(e.target.files)} />
          </Button>
          {images && images.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {images.length} file(s) selected
            </Typography>
          )}
          {error && <Typography color="error" variant="body2">{error}</Typography>}
          <Button variant="contained" type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
        </Box>
      </Paper>
    </Box>
  )
}


