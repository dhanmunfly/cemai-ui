// Comprehensive API types based on Postman collection

export interface ApiResponse<T> {
  data: T
  timestamp: string
  requestId: string
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
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

export interface User {
  id: string
  name: string
  email: string
  role: 'operator' | 'manager' | 'engineer'
  permissions: string[]
}

export interface RefreshRequest {
  refreshToken: string
}

// Glass Cockpit Types
export interface KpiData {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'normal' | 'warning' | 'critical'
  target: { min: number; max: number }
  timestamp: string
}

export interface KpiResponse {
  specificPower: KpiData
  heatRate: KpiData
}

export interface HealthPrediction {
  system: string
  status: 'stable' | 'warning' | 'critical'
  predictionMinutes?: number
}

export interface HealthPredictionResponse {
  systems: HealthPrediction[]
}

export interface ProcessAlert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  acknowledged: boolean
}

export interface LogEntry {
  id: string
  timestamp: number
  agent: 'guardian' | 'optimizer' | 'master' | 'egress'
  level: 'info' | 'warning' | 'error'
  message: string
}

// Co-Pilot Types
export interface AgentState {
  autonomy: 'on' | 'paused' | 'manual'
  reason?: string
  pendingDecisionId?: string
}

export interface AgentProposal {
  id: string
  agent: 'guardian' | 'optimizer'
  title: string
  description: string
  adjustments: Record<string, number>
  predictedImpact: Record<string, number>
  confidence: number
}

export interface DecisionSynthesis {
  summary: string
  rationale: string
  recommendedAdjustments: Record<string, number>
}

export interface DecisionPayload {
  id: string
  guardian: AgentProposal
  optimizer: AgentProposal
  synthesis: DecisionSynthesis
  createdAt: string
}

export interface PendingDecisionsResponse {
  decisions: DecisionPayload[]
}

export interface DecisionHistoryEntry {
  id: string
  timestamp: string
  status: 'approved' | 'rejected' | 'pending'
  summary: string
  impact?: Record<string, number>
  rationale?: string
}

export interface DecisionHistoryResponse {
  decisions: DecisionHistoryEntry[]
  total: number
  page: number
  size: number
}

// Oracle Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: any
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  lastMessageAt: string
  messageCount: number
}

export interface ChatResponse {
  message: string
  suggestions?: string[]
  context?: any
}

export interface ChatSuggestionsResponse {
  suggestions: string[]
}

export interface SOP {
  id: string
  title: string
  description: string
  category: string
  content: string
  lastUpdated: string
}

export interface SOPSearchResponse {
  sops: SOP[]
  total: number
}

// Notification Types
export interface Notification {
  id: string
  type: 'decision_pending' | 'system_alert' | 'maintenance' | 'info' | 'optimization' | 'quality'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}

// Audit Types
export interface AuditEvent {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface AuditEventsResponse {
  events: AuditEvent[]
  total: number
  page: number
  size: number
}

// System Configuration Types
export interface SystemConfig {
  version: string
  environment: 'development' | 'staging' | 'production'
  features: {
    autonomy: boolean
    chat: boolean
    notifications: boolean
    audit: boolean
  }
  limits: {
    maxDecisionsPerHour: number
    maxChatMessagesPerSession: number
    maxNotificationsPerUser: number
  }
  maintenance: {
    scheduledMaintenance: string
    maintenanceWindow: string
  }
}

export interface SystemVersion {
  version: string
  build: string
  commit: string
  deployedAt: string
}

export interface PingResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
}

// Guardian Agent Types
export interface GuardianStatus {
  status: 'active' | 'inactive' | 'error'
  lastHealthCheck: string
  monitoringSystems: string[]
  alerts: number
  predictions: {
    nextMaintenance: string
    riskLevel: 'low' | 'medium' | 'high'
  }
}

export interface StabilityPredictionRequest {
  kilnSpeed: number
  fuelFlow: number
  feedRate: number
  preheaterTemp: number
  lsf: number
  timestamp: string
}

export interface StabilityPrediction {
  prediction: {
    stability: 'stable' | 'unstable' | 'critical'
    confidence: number
    timeframe: string
  }
  recommendations: string[]
  risks: string[]
}

export interface QualityMetrics {
  lsf: number
  smr: number
  amr: number
  quality: 'within_spec' | 'out_of_spec' | 'critical'
  lastMeasurement: string
  trend: 'improving' | 'stable' | 'deteriorating'
}

export interface ControlActionValidation {
  action: string
  value: number
  currentValue: number
  reason: string
}

export interface ValidationResult {
  valid: boolean
  warnings: string[]
  errors: string[]
  recommendations?: string[]
}

// Optimizer Agent Types
export interface FuelMix {
  coal: number
  biomass: number
  waste: number
}

export interface OptimizationConstraints {
  maxAlternativeFuel: number
  minCoal: number
  maxWaste: number
}

export interface MarketPrices {
  coal: number
  biomass: number
  waste: number
}

export interface FuelOptimizationRequest {
  currentFuelMix: FuelMix
  constraints: OptimizationConstraints
  marketPrices: MarketPrices
}

export interface FuelOptimization {
  optimizedMix: FuelMix
  projectedSavings: {
    costReduction: number
    co2Reduction: number
  }
  constraints: OptimizationConstraints
  confidence: number
}

export interface CurrentOptimization {
  activeOptimizations: Array<{
    type: string
    status: 'active' | 'paused' | 'completed'
    savings: number
  }>
  lastUpdate: string
  nextOptimization: string
}

export interface MarketSensitivity {
  sensitivities: Record<string, number>
  volatility: 'low' | 'medium' | 'high'
  lastUpdate: string
}

export interface MarketUpdate {
  type: string
  data: MarketPrices
  timestamp: string
}

// Master Control Agent Types
export interface WorkflowOrchestrationRequest {
  workflowType: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  context: Record<string, any>
}

export interface WorkflowOrchestration {
  requestId: string
  status: 'initiated' | 'in_progress' | 'completed' | 'failed'
  workflowType: string
  priority: string
  estimatedDuration: string
  steps: Array<{
    step: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
  }>
}

export interface WorkflowStatus {
  requestId: string
  status: 'initiated' | 'in_progress' | 'completed' | 'failed'
  currentStep: string
  progress: number
  estimatedCompletion: string
  errors?: string[]
}

export interface AgentBroadcast {
  message: string
  targetAgents: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// Egress Agent Types
export interface OPCUAStatus {
  connection: 'connected' | 'disconnected' | 'error'
  lastHeartbeat: string
  nodes: {
    total: number
    active: number
    error: number
  }
  latency: number
}

export interface CommandExecutionRequest {
  command: string
  parameters: Record<string, any>
  validation: boolean
  timeout: number
}

export interface CommandExecution {
  commandId: string
  status: 'executed' | 'failed' | 'timeout'
  result: 'success' | 'error' | 'warning'
  timestamp: string
  response?: Record<string, any>
  error?: string
}

export interface CommandHistoryEntry {
  id: string
  command: string
  parameters: Record<string, any>
  status: 'success' | 'error' | 'timeout'
  timestamp: string
  executedBy: string
  response?: Record<string, any>
}

export interface CommandValidationRequest {
  command: string
  parameters: Record<string, any>
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  requestId: string
}

export interface ValidationError extends ApiError {
  field: string
  value: any
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
}

export interface KpiUpdateMessage {
  type: 'kpi_update'
  data: Record<string, KpiData>
}

export interface AgentProposalMessage {
  type: 'agent_proposal'
  data: AgentProposal
}

export interface LogEntryMessage {
  type: 'log_entry'
  data: LogEntry
}

export interface ProcessAlertMessage {
  type: 'process_alert'
  data: ProcessAlert
}

export interface NotificationMessage {
  type: 'notification'
  data: Notification
}

export interface SystemStatusMessage {
  type: 'system_status'
  data: {
    status: 'online' | 'offline' | 'maintenance'
    timestamp: string
  }
}

// Union types for WebSocket messages
export type WebSocketEventData = 
  | KpiUpdateMessage
  | AgentProposalMessage
  | LogEntryMessage
  | ProcessAlertMessage
  | NotificationMessage
  | SystemStatusMessage

// Request/Response wrapper types
export interface PaginatedRequest {
  page?: number
  size?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  size: number
  hasMore: boolean
}

export interface DateRangeRequest {
  from: string
  to: string
}

export interface FilterRequest {
  status?: string
  level?: string
  agent?: string
  type?: string
}

