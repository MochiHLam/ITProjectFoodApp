import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const url = (import.meta as any).env.VITE_WS_URL || 'http://localhost:4000'
    const s = io(url)
    socketRef.current = s

    if (user?._id) {
      s.emit('join:user', user._id)
    }

    return () => {
      if (user?._id) {
        s.emit('leave:user', user._id)
      }
      s.close()
    }
  }, [user?._id])

  return socketRef
}



