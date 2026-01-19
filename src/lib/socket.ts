import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from './env'

// Extract socket URL from API base URL
// Mobile app uses socketBaseUrl, web will use same base
const getSocketUrl = () => {
  // If API_BASE_URL is https://app.reeltok.net/api, socket might be at https://app.reeltok.net
  const url = new URL(API_BASE_URL)
  return `${url.protocol}//${url.host}`
}

let socket: Socket | null = null

export const initializeSocket = (user: any) => {
  if (socket?.connected) {
    return socket
  }

  const socketUrl = getSocketUrl()
  socket = io(socketUrl, {
    forceNew: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Socket connected')
    if (user) {
      socket?.emit('setup', user)
    }
  })

  socket.on('connection', () => {
    console.log('Socket connection established')
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error)
  })

  return socket
}

export const getSocket = () => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default socket
