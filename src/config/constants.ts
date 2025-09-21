export const KPI_TARGETS = {
  specificPower: { min: 26, max: 30 },
  heatRate: { min: 700, max: 820 },
  clinkerLSF: { min: 95, max: 98 },
  tsr: { min: 10, max: 30 },
} as const

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://cemai-infrastructure-agents-dev-917156149361.asia-south1.run.app',
  WS_URL: import.meta.env.VITE_WS_URL || 'wss://cemai-infrastructure-agents-dev-917156149361.asia-south1.run.app',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const

// Polling intervals
export const POLLING_INTERVALS = {
  KPIS: 5000, // 5 seconds
  HEALTH: 10000, // 10 seconds
  LOGS: 2000, // 2 seconds
  DECISIONS: 3000, // 3 seconds
} as const


