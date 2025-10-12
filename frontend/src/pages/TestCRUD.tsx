import { useState } from 'react'
import { Button, Box, Typography, TextField, Paper, Stack } from '@mui/material'
import { createProduct, listProducts, deleteProduct } from '../api/products'

export default function TestCRUD() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<FileList | null>(null)
  const [result, setResult] = useState('')
  const [products, setProducts] = useState<any[]>([])

  async function testCreate() {
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('price', price)
      if (images) {
        Array.from(images).forEach((f) => fd.append('images', f))
      }
      const data = await createProduct(fd)
      setResult(`Created: ${JSON.stringify(data)}`)
      loadProducts()
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    }
  }

  async function loadProducts() {
    try {
      const data = await listProducts({})
      setProducts(data.items || [])
      setResult(`Loaded ${data.items?.length || 0} products`)
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    }
  }

  async function testDelete(id: string) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setResult('Error: No JWT token found. Please login first.')
        return
      }
      await deleteProduct(id)
      setResult(`Deleted product ${id}`)
      loadProducts()
    } catch (err: any) {
      setResult(`Error: ${err.message}`)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Test CRUD</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <TextField 
            label="Product Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            fullWidth 
          />
          <TextField 
            label="Price" 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            fullWidth 
          />
          <Button variant="outlined" component="label">
            Upload Images
            <input hidden type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
          </Button>
          {images && images.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {images.length} file(s) selected
            </Typography>
          )}
          <Button variant="contained" onClick={testCreate}>
            Create Product
          </Button>
          <Button variant="outlined" onClick={loadProducts}>
            Load Products
          </Button>
        </Stack>
      </Paper>

      {result && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
          <Typography variant="body2">{result}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Products ({products.length})</Typography>
        {products.map((p) => (
          <Box key={p._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
            <Box>
              <Typography>{p.name} - ${p.price}</Typography>
              {p.images && p.images.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {p.images.length} image(s)
                </Typography>
              )}
            </Box>
            <Button color="error" onClick={() => testDelete(p._id)}>Delete</Button>
          </Box>
        ))}
      </Paper>
    </Box>
  )
}
