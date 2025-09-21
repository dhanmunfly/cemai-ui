import type { WebSocketEventData, WebSocketMessage } from '@/types/api'

export interface WebSocketConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

export interface WebSocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  onMessage?: <T extends WebSocketEventData>(message: T) => void
  onReconnect?: (attempt: number) => void
}

class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private handlers: WebSocketEventHandlers
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private isConnecting = false
  private isManualDisconnect = false

  constructor(config: WebSocketConfig, handlers: WebSocketEventHandlers = {}) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config
    }
    this.handlers = handlers
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'))
        return
      }

      this.isConnecting = true
      this.isManualDisconnect = false

      try {
        this.ws = new WebSocket(this.config.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.handlers.onConnect?.()
          resolve()
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()
          this.handlers.onDisconnect?.()

          if (!this.isManualDisconnect && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.isConnecting = false
          this.handlers.onError?.(error)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage<WebSocketEventData> = JSON.parse(event.data)
            this.handlers.onMessage?.(message.data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.isManualDisconnect = true
    this.stopHeartbeat()
    this.clearReconnectTimer()
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
  }

  send<T = any>(data: T): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not connected, cannot send message')
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`)
      
      this.handlers.onReconnect?.(this.reconnectAttempts)
      
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error)
      })
    }, this.config.reconnectInterval)
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: new Date().toISOString() })
      }
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
}

// Factory function to create WebSocket service with CemAI configuration
export function createCemAIWebSocket(handlers: WebSocketEventHandlers = {}): WebSocketService {
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://cemai-infrastructure-agents-dev-917156149361.asia-south1.run.app'
  const wsURL = baseURL.replace(/^https?/, 'wss')
  
  return new WebSocketService(
    {
      url: `${wsURL}/ws`,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    },
    handlers
  )
}

// Hook for React components
export function useWebSocket(config: WebSocketConfig, handlers: WebSocketEventHandlers = {}) {
  const ws = new WebSocketService(config, handlers)
  
  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    send: <T = any>(data: T) => ws.send(data),
    isConnected: () => ws.isConnected(),
    getConnectionState: () => ws.getConnectionState()
  }
}

export default WebSocketService
