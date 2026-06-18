import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material'
import { CartProvider } from './contexts/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import ProductDetail from './pages/ProductDetail'
import ProductEdit from './pages/ProductEdit'
import UserManagement from './pages/UserManagement'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OAuthCallback from './pages/OAuthCallback'
import { useAuth } from './hooks/useAuth'

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1976d2' } },
})

// App: khai báo toàn bộ routes và providers
export default function App() {
  const { token, user } = useAuth()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <BrowserRouter>
          <NavBar />
          <Container sx={{ py: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={token ? <ProductForm /> : <Navigate to="/login" replace />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/products/:id/edit" element={token ? <ProductEdit /> : <Navigate to="/login" replace />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={token ? <Checkout /> : <Navigate to="/login" replace />} />
              <Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" replace />} />
              <Route path="/users" element={token && user?.role === 'admin' ? <UserManagement /> : <Navigate to="/" replace />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </CartProvider>
    </ThemeProvider>
  )
}
