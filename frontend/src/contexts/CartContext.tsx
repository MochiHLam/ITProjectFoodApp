import React, { createContext, useContext, useReducer, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

export type CartItem = {
  product: {
    _id: string
    name: string
    images: string[]
    price: number
    description?: string
  }
  quantity: number
}

type CartState = {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

type CartAction = 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(
        item => item.product._id === action.payload.product._id
      )
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product._id === action.payload.product._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        }
      } else {
        const newItems = [...state.items, action.payload]
        return {
          ...state,
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        item => item.product._id !== action.payload
      )
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.productId })
      }
      
      const updatedItems = state.items.map(item =>
        item.product._id === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      }
    }
    
    case 'CLEAR_CART':
      return initialState
      
    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load cart when user changes
  React.useEffect(() => {
    if (!user) return
    
    const cartKey = `cart_${user._id}`
    const savedCart = localStorage.getItem(cartKey)
    
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        // Clear current cart and load saved data
        dispatch({ type: 'CLEAR_CART' })
        cartData.items.forEach((item: CartItem) => {
          dispatch({ type: 'ADD_ITEM', payload: item })
        })
      } catch (error) {
        console.error('Failed to parse saved cart:', error)
        dispatch({ type: 'CLEAR_CART' })
      }
    } else {
      dispatch({ type: 'CLEAR_CART' })
    }
    setIsInitialized(true)
  }, [user])

  // Save cart to localStorage whenever state changes - user specific
  React.useEffect(() => {
    if (!isInitialized || !user) return
    
    const cartKey = `cart_${user._id}`
    localStorage.setItem(cartKey, JSON.stringify(state))
  }, [state, user, isInitialized])

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  
  // Add clearCart function
  const clearCart = () => {
    context.dispatch({ type: 'CLEAR_CART' })
  }
  
  return { ...context, clearCart }
}
