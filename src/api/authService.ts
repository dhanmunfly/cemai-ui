import axios from 'axios'

export interface User {
  id: string
  name: string
  email: string
  role: 'operator' | 'manager' | 'engineer'
  permissions: string[]
}

export interface AuthResponse {
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
  timestamp: string
  requestId: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}

class AuthService {
  private baseURL: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private isRefreshing: boolean = false
  private refreshPromise: Promise<AuthResponse> | null = null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://cemai-infrastructure-agents-dev-917156149361.asia-south1.run.app'
    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      (config) => {
        if (this.accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await this.refreshTokenRequest()
            originalRequest.headers.Authorization = `Bearer ${newToken.data.accessToken}`
            return axios(originalRequest)
          } catch (refreshError) {
            this.logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Request-Id': this.generateRequestId(),
      ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${this.baseURL}/api/v1/auth/login`,
        credentials,
        { headers: this.getHeaders() }
      )
      
      this.accessToken = response.data.data.accessToken
      this.refreshToken = response.data.data.refreshToken
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', this.accessToken)
      localStorage.setItem('refreshToken', this.refreshToken)
      
      return response.data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  async refreshTokenRequest(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${this.baseURL}/api/v1/auth/refresh`,
        { refreshToken: this.refreshToken },
        { headers: this.getHeaders() }
      )
      
      this.accessToken = response.data.data.accessToken
      this.refreshToken = response.data.data.refreshToken
      
      // Update stored tokens
      localStorage.setItem('accessToken', this.accessToken)
      localStorage.setItem('refreshToken', this.refreshToken)
      
      return response.data
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.logout()
      throw error
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get<{ data: User }>(
        `${this.baseURL}/api/v1/auth/me`,
        { headers: this.getHeaders() }
      )
      return response.data.data
    } catch (error) {
      console.error('Get current user failed:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await axios.post(
          `${this.baseURL}/api/v1/auth/logout`,
          { refreshToken: this.refreshToken },
          { headers: this.getHeaders() }
        )
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  // Initialize tokens from localStorage
  initializeFromStorage(): void {
    this.accessToken = localStorage.getItem('accessToken')
    this.refreshToken = localStorage.getItem('refreshToken')
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

export const authService = new AuthService()
