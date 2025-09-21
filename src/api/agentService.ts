import axios from 'axios'
import type { KpiMap } from '@/types/kpi'
import type { HealthMap, ProcessSystem, HealthStatus } from '@/types/process'
import type { LogEntry } from '@/types/log'
import type { DecisionPayload } from '@/types/decision'
import type {
  ApiResponse,
  KpiResponse,
  HealthPredictionResponse,
  AgentState,
  PendingDecisionsResponse,
  ChatResponse,
  Notification,
  AuditEvent,
  SystemConfig,
  GuardianStatus,
  StabilityPrediction,
  QualityMetrics,
  ValidationResult,
  FuelOptimization,
  CurrentOptimization,
  MarketSensitivity,
  WorkflowOrchestration,
  WorkflowStatus,
  OPCUAStatus,
  CommandExecution,
  CommandHistoryEntry
} from '@/types/api'
import { authService } from './authService'


class AgentService {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://cemai-infrastructure-agents-dev-917156149361.asia-south1.run.app'
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Request-Id': this.generateRequestId(),
      ...(authService.getAccessToken() && { Authorization: `Bearer ${authService.getAccessToken()}` }),
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  }

  private async handleApiCall<T>(apiCall: () => Promise<T>, fallback: () => T): Promise<T> {
    try {
      return await apiCall()
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return fallback()
    }
  }

  // Glass Cockpit APIs
  async getRealtimeKpis(): Promise<KpiMap> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<KpiResponse>>(
          `${this.baseURL}/api/v1/kpis/realtime`,
          { headers: this.getHeaders() }
        )
        
        const kpiData = response.data.data
        const now = Date.now()
        
        return {
          specificPower: {
            id: 'specificPower' as const,
            name: kpiData.specificPower.name,
            value: kpiData.specificPower.value,
            unit: kpiData.specificPower.unit,
            trend: kpiData.specificPower.trend,
            status: kpiData.specificPower.status as 'normal' | 'warning' | 'critical' | 'offline',
            target: kpiData.specificPower.target,
            timestamp: now,
          },
          heatRate: {
            id: 'heatRate' as const,
            name: kpiData.heatRate.name,
            value: kpiData.heatRate.value,
            unit: kpiData.heatRate.unit,
            trend: kpiData.heatRate.trend,
            status: kpiData.heatRate.status as 'normal' | 'warning' | 'critical' | 'offline',
            target: kpiData.heatRate.target,
            timestamp: now,
          },
          clinkerLSF: {
            id: 'clinkerLSF' as const,
            name: 'Clinker LSF',
            value: 96.5,
            unit: '',
            trend: 'down' as const,
            status: 'warning' as const,
            target: { min: 95, max: 98 },
            timestamp: now,
          },
          tsr: {
            id: 'tsr' as const,
            name: 'TSR',
            value: 18,
            unit: '%',
            trend: 'up' as const,
            status: 'normal' as const,
            target: { min: 10, max: 30 },
            timestamp: now,
          },
        }
      },
      () => this.getMockKpis()
    )
  }

  async getKpiHistory(from: string, to: string, interval: string = '1h'): Promise<any> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any>>(
          `${this.baseURL}/api/v1/kpis/history`,
          {
            headers: this.getHeaders(),
            params: { from, to, interval }
          }
        )
        return response.data.data
      },
      () => ({ history: [] })
    )
  }

  async getHealthPredictions(systems: string[] = ['kiln', 'preheater', 'mill', 'cooler']): Promise<HealthMap> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<HealthPredictionResponse>>(
          `${this.baseURL}/api/v1/health/predictions`,
          { systems },
          { headers: this.getHeaders() }
        )
        
        const healthData = response.data.data.systems
        const healthMap: HealthMap = {
          kiln: { system: 'kiln', status: 'stable' },
          cooler: { system: 'cooler', status: 'stable' },
          mill: { system: 'mill', status: 'stable' }
        }
        
        healthData.forEach(system => {
          if (system.system in healthMap) {
            healthMap[system.system as keyof HealthMap] = {
              system: system.system as ProcessSystem,
              status: system.status as HealthStatus,
              predictionMinutes: system.predictionMinutes,
            }
          }
        })
        
        return healthMap
      },
      () => this.getMockHealthPredictions()
    )
  }

  async getProcessAlerts(): Promise<any[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any[]>>(
          `${this.baseURL}/api/v1/alerts/process`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => []
    )
  }

  async getMasterLogs(level: string = 'info', limit: number = 50): Promise<LogEntry[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any[]>>(
          `${this.baseURL}/api/v1/logs/master`,
          {
            headers: this.getHeaders(),
            params: { level, limit }
          }
        )
        
        return response.data.data.map((log: any) => ({
          id: log.id,
          timestamp: new Date(log.timestamp).getTime(),
          agent: log.agent,
          level: log.level,
          message: log.message,
        }))
      },
      () => []
    )
  }

  // Co-Pilot APIs
  async getAgentState(): Promise<AgentState> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<AgentState>>(
          `${this.baseURL}/api/v1/agent/state`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ autonomy: 'paused', reason: 'decision_required', pendingDecisionId: 'dec_123' })
    )
  }

  async pauseAutonomy(reason: string): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/api/v1/agent/pause`,
          { reason },
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Autonomy paused')
    )
  }

  async resumeAutonomy(): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/api/v1/agent/resume`,
          {},
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Autonomy resumed')
    )
  }

  async setManualMode(reason: string): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/api/v1/agent/manual`,
          { reason },
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Manual mode set')
    )
  }

  async getPendingDecisions(): Promise<DecisionPayload[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<PendingDecisionsResponse>>(
          `${this.baseURL}/api/v1/decisions/pending`,
          { headers: this.getHeaders() }
        )
        return response.data.data.decisions
      },
      () => this.getMockPendingDecisions()
    )
  }

  async approveDecision(decisionId: string, rationale: string): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/api/v1/decisions/${decisionId}/approve`,
          { rationale },
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Decision approved')
    )
  }

  async rejectDecision(decisionId: string, rationale: string): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/api/v1/decisions/${decisionId}/reject`,
          { rationale },
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Decision rejected')
    )
  }

  async getDecisionDetails(decisionId: string): Promise<any> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any>>(
          `${this.baseURL}/api/v1/decisions/${decisionId}`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({
        id: decisionId,
        guardian: {
          id: 'prop_guardian_' + decisionId,
          agent: 'guardian',
          title: 'Sample Guardian Proposal',
          description: 'Sample guardian proposal description',
          adjustments: { kiln_speed: 0.1 },
          predictedImpact: { lsf_deviation: -0.5 },
          confidence: 0.95,
        },
        optimizer: {
          id: 'prop_optimizer_' + decisionId,
          agent: 'optimizer',
          title: 'Sample Optimizer Proposal',
          description: 'Sample optimizer proposal description',
          adjustments: { alternative_fuel_ratio: 0.05 },
          predictedImpact: { cost_savings: 2.5 },
          confidence: 0.88,
        },
        synthesis: {
          summary: 'Sample synthesis summary',
          rationale: 'Sample synthesis rationale',
          recommendedAdjustments: {
            kiln_speed: 0.1,
            alternative_fuel_ratio: 0.02,
          },
        },
        createdAt: new Date().toISOString(),
      })
    )
  }

  async getDecisionHistory(page: number = 1, size: number = 20, status?: string): Promise<any> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any>>(
          `${this.baseURL}/api/v1/decisions/history`,
          {
            headers: this.getHeaders(),
            params: { page, size, status }
          }
        )
        return response.data.data
      },
      () => ({ decisions: [], total: 0 })
    )
  }

  // Oracle APIs
  async sendChatMessage(message: string, context?: any): Promise<ChatResponse> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<ChatResponse>>(
          `${this.baseURL}/api/v1/chat/message`,
          { message, context },
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ message: 'Mock response: ' + message })
    )
  }

  async getChatSessions(): Promise<any[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any[]>>(
          `${this.baseURL}/api/v1/chat/sessions`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => []
    )
  }

  async getChatMessages(sessionId: string): Promise<any[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any[]>>(
          `${this.baseURL}/api/v1/chat/sessions/${sessionId}/messages`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => []
    )
  }

  async getChatSuggestions(context: string): Promise<string[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<{ suggestions: string[] }>>(
          `${this.baseURL}/api/v1/chat/suggestions`,
          { context },
          { headers: this.getHeaders() }
        )
        return response.data.data.suggestions
      },
      () => ['Show me the SOP for LSF deviation', 'What is the current kiln temperature?']
    )
  }

  async searchSOPs(query: string, limit: number = 10): Promise<any[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any[]>>(
          `${this.baseURL}/api/v1/sops/search`,
          {
            headers: this.getHeaders(),
            params: { q: query, limit }
          }
        )
        return response.data.data
      },
      () => []
    )
  }

  async getSOPDetails(sopId: string): Promise<any> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any>>(
          `${this.baseURL}/api/v1/sops/${sopId}`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({
        id: sopId,
        title: 'Sample SOP',
        description: 'Sample SOP description',
        content: 'Sample SOP content',
        category: 'maintenance',
        lastUpdated: new Date().toISOString()
      })
    )
  }

  // Notifications & Audit APIs
  async getNotifications(unreadOnly: boolean = true, page: number = 1, size: number = 20): Promise<Notification[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<Notification[]>>(
          `${this.baseURL}/api/v1/notifications`,
          {
            headers: this.getHeaders(),
            params: { unreadOnly, page, size }
          }
        )
        return response.data.data
      },
      () => this.getMockNotifications()
    )
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/api/v1/notifications/${notificationId}/read`,
          {},
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Notification marked as read')
    )
  }

  async getAuditEvents(from: string, to: string, page: number = 1, size: number = 50): Promise<AuditEvent[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<AuditEvent[]>>(
          `${this.baseURL}/api/v1/audit/events`,
          {
            headers: this.getHeaders(),
            params: { from, to, page, size }
          }
        )
        return response.data.data
      },
      () => this.getMockAuditEvents()
    )
  }

  // System Configuration APIs
  async getSystemConfig(): Promise<SystemConfig> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<SystemConfig>>(
          `${this.baseURL}/api/v1/config/system`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockSystemConfig()
    )
  }

  async ping(): Promise<{ status: string }> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<{ status: string }>>(
          `${this.baseURL}/api/v1/ping`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ status: 'ok' })
    )
  }

  async getSystemVersion(): Promise<{ version: string }> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<{ version: string }>>(
          `${this.baseURL}/api/v1/version`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ version: '1.0.0-dev' })
    )
  }

  // Guardian Agent APIs
  async getGuardianHealth(): Promise<{ status: string }> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<{ status: string }>>(
          `${this.baseURL}/guardian/health`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ status: 'healthy' })
    )
  }

  async getGuardianStatus(): Promise<GuardianStatus> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<GuardianStatus>>(
          `${this.baseURL}/guardian/status`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockGuardianStatus()
    )
  }

  async predictStability(data: {
    kilnSpeed: number
    fuelFlow: number
    feedRate: number
    preheaterTemp: number
    lsf: number
    timestamp: string
  }): Promise<StabilityPrediction> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<StabilityPrediction>>(
          `${this.baseURL}/guardian/predict`,
          data,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockStabilityPrediction()
    )
  }

  async getCurrentQuality(): Promise<QualityMetrics> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<QualityMetrics>>(
          `${this.baseURL}/guardian/current-quality`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockCurrentQuality()
    )
  }

  async validateControlAction(action: {
    action: string
    value: number
    currentValue: number
    reason: string
  }): Promise<ValidationResult> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<ValidationResult>>(
          `${this.baseURL}/guardian/validate-action`,
          action,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ valid: true, warnings: [], errors: [] })
    )
  }

  async emergencyStop(): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/guardian/emergency-stop`,
          {},
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Emergency stop activated')
    )
  }

  // Optimizer Agent APIs
  async getOptimizerHealth(): Promise<{ status: string }> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<{ status: string }>>(
          `${this.baseURL}/optimizer/health`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ status: 'healthy' })
    )
  }

  async optimizeFuelMix(data: {
    currentFuelMix: { coal: number; biomass: number; waste: number }
    constraints: { maxAlternativeFuel: number; minCoal: number }
    marketPrices: { coal: number; biomass: number; waste: number }
  }): Promise<FuelOptimization> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<FuelOptimization>>(
          `${this.baseURL}/optimizer/v1/optimize`,
          data,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockFuelOptimization()
    )
  }

  async getCurrentOptimization(): Promise<CurrentOptimization> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<CurrentOptimization>>(
          `${this.baseURL}/optimizer/v1/current-optimization`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockCurrentOptimization()
    )
  }

  async validateConstraints(constraints: any[]): Promise<any> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<any>>(
          `${this.baseURL}/optimizer/v1/validate-constraints`,
          constraints,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ valid: true, violations: [] })
    )
  }

  async processMarketUpdate(data: {
    type: string
    data: { coal: number; biomass: number; waste: number }
    timestamp: string
  }): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/optimizer/v1/market-update`,
          data,
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Market update processed')
    )
  }

  async getMarketSensitivity(): Promise<MarketSensitivity> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<MarketSensitivity>>(
          `${this.baseURL}/optimizer/v1/market-sensitivity`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockMarketSensitivity()
    )
  }

  // Master Control Agent APIs
  async getMasterControlHealth(): Promise<{ status: string }> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<{ status: string }>>(
          `${this.baseURL}/master-control/health`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ status: 'healthy' })
    )
  }

  async orchestrateWorkflow(data: {
    workflowType: string
    priority: string
    context: any
  }): Promise<WorkflowOrchestration> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<WorkflowOrchestration>>(
          `${this.baseURL}/master-control/v1/orchestrate`,
          data,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockWorkflowOrchestration()
    )
  }

  async getWorkflowStatus(requestId: string): Promise<WorkflowStatus> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<WorkflowStatus>>(
          `${this.baseURL}/master-control/v1/workflow-status/${requestId}`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockWorkflowStatus()
    )
  }

  async resumeWorkflow(requestId: string): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/master-control/v1/workflow-resume/${requestId}`,
          {},
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Workflow resumed')
    )
  }

  async broadcastToAgents(data: {
    message: string
    targetAgents: string[]
    priority: string
  }): Promise<void> {
    return this.handleApiCall(
      async () => {
        await axios.post(
          `${this.baseURL}/master-control/a2a/broadcast`,
          data,
          { headers: this.getHeaders() }
        )
      },
      () => console.log('Mock: Broadcast sent to agents')
    )
  }

  async getMasterDecisionHistory(from: string, to: string): Promise<any> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<any>>(
          `${this.baseURL}/master-control/v1/decision-history`,
          {
            headers: this.getHeaders(),
            params: { from, to }
          }
        )
        return response.data.data
      },
      () => this.getMockMasterDecisionHistory()
    )
  }

  // Egress Agent APIs
  async getEgressHealth(): Promise<{ status: string }> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<{ status: string }>>(
          `${this.baseURL}/egress/health`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ status: 'healthy' })
    )
  }

  async getOPCUAStatus(): Promise<OPCUAStatus> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<OPCUAStatus>>(
          `${this.baseURL}/egress/opcua/status`,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockOPCUAStatus()
    )
  }

  async executeCommand(data: {
    command: string
    parameters: any
    validation: boolean
    timeout: number
  }): Promise<CommandExecution> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<CommandExecution>>(
          `${this.baseURL}/egress/execute`,
          data,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => this.getMockCommandExecution()
    )
  }

  async getCommandHistory(limit: number = 50): Promise<CommandHistoryEntry[]> {
    return this.handleApiCall(
      async () => {
        const response = await axios.get<ApiResponse<CommandHistoryEntry[]>>(
          `${this.baseURL}/egress/commands/history`,
          {
            headers: this.getHeaders(),
            params: { limit }
          }
        )
        return response.data.data
      },
      () => this.getMockCommandHistory()
    )
  }

  async validateCommand(data: {
    command: string
    parameters: any
  }): Promise<ValidationResult> {
    return this.handleApiCall(
      async () => {
        const response = await axios.post<ApiResponse<ValidationResult>>(
          `${this.baseURL}/egress/validate`,
          data,
          { headers: this.getHeaders() }
        )
        return response.data.data
      },
      () => ({ valid: true, warnings: [], errors: [] })
    )
  }

  // Mock data fallbacks
  private getMockKpis(): KpiMap {
    const now = Date.now()
    return {
      specificPower: {
        id: 'specificPower' as const,
        name: 'Specific Power',
        value: 28.5,
        unit: 'kWh/ton',
        trend: 'up' as const,
        status: 'normal' as const,
        target: { min: 26, max: 30 },
        timestamp: now,
      },
      heatRate: {
        id: 'heatRate' as const,
        name: 'Heat Rate',
        value: 780,
        unit: 'kcal/kg',
        trend: 'stable' as const,
        status: 'normal' as const,
        target: { min: 700, max: 820 },
        timestamp: now,
      },
      clinkerLSF: {
        id: 'clinkerLSF' as const,
        name: 'Clinker LSF',
        value: 96.5,
        unit: '',
        trend: 'down' as const,
        status: 'warning' as const,
        target: { min: 95, max: 98 },
        timestamp: now,
      },
      tsr: {
        id: 'tsr' as const,
        name: 'TSR',
        value: 18,
        unit: '%',
        trend: 'up' as const,
        status: 'normal' as const,
        target: { min: 10, max: 30 },
        timestamp: now,
      },
    }
  }

  private getMockHealthPredictions(): HealthMap {
    return {
      kiln: { system: 'kiln', status: 'warning', predictionMinutes: 45 },
      cooler: { system: 'cooler', status: 'stable' },
      mill: { system: 'mill', status: 'critical', predictionMinutes: 10 },
    }
  }

  private getMockPendingDecisions(): DecisionPayload[] {
    return [
      {
        id: 'dec_123',
        guardian: {
          id: 'prop_guardian_123',
          agent: 'guardian',
          title: 'LSF Stability Correction',
          description: 'Adjust kiln speed to maintain LSF within quality band',
          adjustments: { kiln_speed: 0.1 },
          predictedImpact: { lsf_deviation: -0.5 },
          confidence: 0.95,
        },
        optimizer: {
          id: 'prop_optimizer_123',
          agent: 'optimizer',
          title: 'Fuel Mix Optimization',
          description: 'Increase alternative fuel ratio for cost savings',
          adjustments: { alternative_fuel_ratio: 0.05 },
          predictedImpact: { cost_savings: 2.5 },
          confidence: 0.88,
        },
        synthesis: {
          summary: 'Combined stability and optimization approach',
          rationale: 'Guardian proposal takes priority for safety, optimizer adjustments applied within safety bounds',
          recommendedAdjustments: {
            kiln_speed: 0.1,
            alternative_fuel_ratio: 0.02,
          },
        },
        createdAt: new Date().toISOString(),
      },
    ]
  }

  private getMockNotifications(): Notification[] {
    return [
      {
        id: 'notif_001',
        type: 'decision_pending',
        title: 'Decision Required',
        message: 'New AI proposal requires your approval',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high'
      },
      {
        id: 'notif_002',
        type: 'system_alert',
        title: 'Kiln Temperature Alert',
        message: 'Kiln temperature approaching critical threshold',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false,
        priority: 'critical'
      }
    ]
  }

  private getMockAuditEvents(): AuditEvent[] {
    return [
      {
        id: 'audit_001',
        timestamp: new Date().toISOString(),
        user: 'operator@cemai.com',
        action: 'decision_approved',
        resource: 'decision_dec_123',
        details: { decisionId: 'dec_123', rationale: 'Approved based on safety analysis' }
      },
      {
        id: 'audit_002',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        user: 'operator@cemai.com',
        action: 'autonomy_paused',
        resource: 'agent_state',
        details: { reason: 'Manual intervention required' }
      }
    ]
  }

  private getMockSystemConfig(): SystemConfig {
    return {
      version: '1.0.0',
      environment: 'production',
      features: {
        autonomy: true,
        chat: true,
        notifications: true,
        audit: true
      },
      limits: {
        maxDecisionsPerHour: 10,
        maxChatMessagesPerSession: 100,
        maxNotificationsPerUser: 50
      },
      maintenance: {
        scheduledMaintenance: '2024-02-15T08:00:00Z',
        maintenanceWindow: '02:00-06:00 UTC'
      }
    }
  }

  private getMockGuardianStatus(): GuardianStatus {
    return {
      status: 'active',
      lastHealthCheck: new Date().toISOString(),
      monitoringSystems: ['kiln', 'preheater', 'cooler'],
      alerts: 0,
      predictions: {
        nextMaintenance: '2024-02-15T08:00:00Z',
        riskLevel: 'low'
      }
    }
  }

  private getMockStabilityPrediction(): StabilityPrediction {
    return {
      prediction: {
        stability: 'stable',
        confidence: 0.92,
        timeframe: 'next_30_minutes'
      },
      recommendations: [
        'Maintain current kiln speed',
        'Monitor LSF trend closely'
      ],
      risks: []
    }
  }

  private getMockCurrentQuality(): QualityMetrics {
    return {
      lsf: 96.5,
      smr: 2.8,
      amr: 1.2,
      quality: 'within_spec',
      lastMeasurement: new Date().toISOString(),
      trend: 'stable'
    }
  }

  private getMockFuelOptimization(): FuelOptimization {
    return {
      optimizedMix: {
        coal: 65,
        biomass: 25,
        waste: 10
      },
      projectedSavings: {
        costReduction: 2.5,
        co2Reduction: 1.2
      },
      constraints: {
        maxAlternativeFuel: 30,
        minCoal: 50,
        maxWaste: 15
      },
      confidence: 0.88
    }
  }

  private getMockCurrentOptimization(): CurrentOptimization {
    return {
      activeOptimizations: [
        {
          type: 'fuel_mix',
          status: 'active',
          savings: 2.1
        }
      ],
      lastUpdate: new Date().toISOString(),
      nextOptimization: '2024-01-15T12:00:00Z'
    }
  }

  private getMockMarketSensitivity(): MarketSensitivity {
    return {
      sensitivities: {
        coal: 0.8,
        biomass: 0.6,
        waste: 0.4
      },
      volatility: 'medium',
      lastUpdate: new Date().toISOString()
    }
  }

  private getMockWorkflowOrchestration(): WorkflowOrchestration {
    return {
      requestId: 'workflow_123',
      status: 'initiated',
      workflowType: 'quality_optimization',
      priority: 'high',
      estimatedDuration: '15_minutes',
      steps: [
        { step: 'guardian_analysis', status: 'pending' },
        { step: 'optimizer_recommendation', status: 'pending' },
        { step: 'synthesis', status: 'pending' }
      ]
    }
  }

  private getMockWorkflowStatus(): WorkflowStatus {
    return {
      requestId: 'workflow_123',
      status: 'in_progress',
      currentStep: 'guardian_analysis',
      progress: 0.3,
      estimatedCompletion: '2024-01-15T10:45:00Z'
    }
  }

  private getMockMasterDecisionHistory(): any {
    return {
      decisions: [
        {
          id: 'dec_001',
          timestamp: new Date().toISOString(),
          status: 'approved',
          summary: 'Kiln speed adjustment for LSF correction',
          impact: { lsf_deviation: -0.5 }
        }
      ],
      total: 1
    }
  }

  private getMockOPCUAStatus(): OPCUAStatus {
    return {
      connection: 'connected',
      lastHeartbeat: new Date().toISOString(),
      nodes: {
        total: 150,
        active: 148,
        error: 2
      },
      latency: 45
    }
  }

  private getMockCommandExecution(): CommandExecution {
    return {
      commandId: 'cmd_123',
      status: 'executed',
      result: 'success',
      timestamp: new Date().toISOString(),
      response: {
        kiln_speed: 3.3,
        previous_value: 3.2
      }
    }
  }

  private getMockCommandHistory(): CommandHistoryEntry[] {
    return [
      {
        id: 'cmd_001',
        command: 'set_kiln_speed',
        parameters: { value: 3.3 },
        status: 'success',
        timestamp: new Date().toISOString(),
        executedBy: 'operator@cemai.com'
      },
      {
        id: 'cmd_002',
        command: 'adjust_fuel_ratio',
        parameters: { ratio: 0.15 },
        status: 'success',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        executedBy: 'system'
      }
    ]
  }
}

export const agentService = new AgentService()

// Legacy exports for backward compatibility
export const getRealtimeKpis = () => agentService.getRealtimeKpis()
export const getHealthPredictions = () => agentService.getHealthPredictions()

export const streamControlLog = (
  onEntry: (entry: LogEntry) => void,
): (() => void) => {
  let cancelled = false
  const agents: LogEntry['agent'][] = ['guardian', 'optimizer', 'master']
  const levels: LogEntry['level'][] = ['info', 'warning', 'error']

  const tick = () => {
    if (cancelled) return
    const now = Date.now()
    const entry: LogEntry = {
      id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: now,
      agent: agents[Math.floor(Math.random() * agents.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      message: generateMockMessage(),
    }
    onEntry(entry)
    setTimeout(tick, 1500)
  }
  tick()
  return () => {
    cancelled = true
  }
}

const generateMockMessage = () => {
  const samples = [
    '[GUARDIAN] Monitoring kiln stability window... OK',
    '[OPTIMIZER] RDF increase +1.5% projected savings $210/hr',
    '[MASTER] Harmonizing proposals: limit RDF to +1% to avoid temp drop',
    '[GUARDIAN] Predicted LSF deviation in 45 min, proposing raw mix tweak',
    '[OPTIMIZER] Fuel rate optimization candidate detected',
  ]
  return samples[Math.floor(Math.random() * samples.length)]
}


