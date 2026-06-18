import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'
import { WS_URL } from '../lib/client'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const s = io(WS_URL)
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



