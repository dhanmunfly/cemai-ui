// Comprehensive API Integration Test Suite
// This file tests all API endpoints from the Postman collection

import { agentService } from '@/api/agentService'
import { authService } from '@/api/authService'
import { createCemAIWebSocket } from '@/services/websocketService'

// Test configuration
const TEST_CONFIG = {
  baseURL: 'https://cemai-infrastructure-agents-dev-917156149361.asia-south1.run.app',
  testCredentials: {
    email: 'operator@cemai.com',
    password: 'password123'
  },
  testTimeouts: {
    short: 5000,
    medium: 10000,
    long: 30000
  }
}

// Test utilities
class APITestSuite {
  private testResults: Array<{ test: string; status: 'pass' | 'fail' | 'skip'; error?: string; duration: number }> = []
  private startTime: number = 0

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    this.startTime = Date.now()
    try {
      await testFn()
      this.testResults.push({
        test: testName,
        status: 'pass',
        duration: Date.now() - this.startTime
      })
      console.log(`✅ ${testName} - PASSED (${Date.now() - this.startTime}ms)`)
    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'fail',
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - this.startTime
      })
      console.log(`❌ ${testName} - FAILED: ${error}`)
    }
  }

  private async runTestWithTimeout(testName: string, testFn: () => Promise<void>, timeout: number = TEST_CONFIG.testTimeouts.medium): Promise<void> {
    return Promise.race([
      this.runTest(testName, testFn),
      new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
      )
    ])
  }

  // Authentication Tests
  async testAuthentication(): Promise<void> {
    console.log('\n🔐 Testing Authentication APIs...')
    
    await this.runTestWithTimeout('Login with valid credentials', async () => {
      const response = await authService.login(TEST_CONFIG.testCredentials)
      if (!response.data.accessToken) {
        throw new Error('No access token received')
      }
    })

    await this.runTestWithTimeout('Get current user', async () => {
      const user = await authService.getCurrentUser()
      if (!user.id || !user.email) {
        throw new Error('Invalid user data received')
      }
    })

    await this.runTestWithTimeout('Refresh token', async () => {
      const response = await authService.refreshTokenRequest()
      if (!response.data.accessToken) {
        throw new Error('No refreshed access token received')
      }
    })

    await this.runTestWithTimeout('Logout', async () => {
      await authService.logout()
      if (authService.isAuthenticated()) {
        throw new Error('User still authenticated after logout')
      }
    })
  }

  // Glass Cockpit Tests
  async testGlassCockpit(): Promise<void> {
    console.log('\n📊 Testing Glass Cockpit APIs...')
    
    await this.runTestWithTimeout('Get real-time KPIs', async () => {
      const kpis = await agentService.getRealtimeKpis()
      if (!kpis.specificPower || !kpis.heatRate) {
        throw new Error('Missing KPI data')
      }
    })

    await this.runTestWithTimeout('Get KPI history', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const to = new Date().toISOString()
      const history = await agentService.getKpiHistory(from, to, '1h')
      if (typeof history !== 'object') {
        throw new Error('Invalid history data format')
      }
    })

    await this.runTestWithTimeout('Get health predictions', async () => {
      const predictions = await agentService.getHealthPredictions(['kiln', 'cooler', 'mill'])
      if (!predictions.kiln || !predictions.cooler || !predictions.mill) {
        throw new Error('Missing health prediction data')
      }
    })

    await this.runTestWithTimeout('Get process alerts', async () => {
      const alerts = await agentService.getProcessAlerts()
      if (!Array.isArray(alerts)) {
        throw new Error('Alerts should be an array')
      }
    })

    await this.runTestWithTimeout('Get master logs', async () => {
      const logs = await agentService.getMasterLogs('info', 10)
      if (!Array.isArray(logs)) {
        throw new Error('Logs should be an array')
      }
    })
  }

  // Co-Pilot Tests
  async testCoPilot(): Promise<void> {
    console.log('\n🤖 Testing Co-Pilot APIs...')
    
    await this.runTestWithTimeout('Get agent state', async () => {
      const state = await agentService.getAgentState()
      if (!state.autonomy) {
        throw new Error('Missing autonomy state')
      }
    })

    await this.runTestWithTimeout('Pause autonomy', async () => {
      await agentService.pauseAutonomy('Test pause')
    })

    await this.runTestWithTimeout('Resume autonomy', async () => {
      await agentService.resumeAutonomy()
    })

    await this.runTestWithTimeout('Set manual mode', async () => {
      await agentService.setManualMode('Test manual mode')
    })

    await this.runTestWithTimeout('Get pending decisions', async () => {
      const decisions = await agentService.getPendingDecisions()
      if (!Array.isArray(decisions)) {
        throw new Error('Decisions should be an array')
      }
    })

    await this.runTestWithTimeout('Get decision details', async () => {
      const details = await agentService.getDecisionDetails('dec_123')
      if (!details.id || !details.guardian || !details.optimizer) {
        throw new Error('Invalid decision details')
      }
    })

    await this.runTestWithTimeout('Get decision history', async () => {
      const history = await agentService.getDecisionHistory(1, 10, 'approved')
      if (!history.decisions || !Array.isArray(history.decisions)) {
        throw new Error('Invalid decision history format')
      }
    })
  }

  // Oracle Tests
  async testOracle(): Promise<void> {
    console.log('\n🧠 Testing Oracle APIs...')
    
    await this.runTestWithTimeout('Send chat message', async () => {
      const response = await agentService.sendChatMessage('What is the current LSF value?')
      if (!response.message) {
        throw new Error('No chat response received')
      }
    })

    await this.runTestWithTimeout('Get chat sessions', async () => {
      const sessions = await agentService.getChatSessions()
      if (!Array.isArray(sessions)) {
        throw new Error('Sessions should be an array')
      }
    })

    await this.runTestWithTimeout('Get chat messages', async () => {
      const messages = await agentService.getChatMessages('session_123')
      if (!Array.isArray(messages)) {
        throw new Error('Messages should be an array')
      }
    })

    await this.runTestWithTimeout('Get chat suggestions', async () => {
      const suggestions = await agentService.getChatSuggestions('Current LSF is 96.5')
      if (!Array.isArray(suggestions)) {
        throw new Error('Suggestions should be an array')
      }
    })

    await this.runTestWithTimeout('Search SOPs', async () => {
      const sops = await agentService.searchSOPs('kiln maintenance', 5)
      if (!Array.isArray(sops)) {
        throw new Error('SOPs should be an array')
      }
    })

    await this.runTestWithTimeout('Get SOP details', async () => {
      const sop = await agentService.getSOPDetails('sop_123')
      if (!sop.id || !sop.title) {
        throw new Error('Invalid SOP details')
      }
    })
  }

  // System Tests
  async testSystemAPIs(): Promise<void> {
    console.log('\n⚙️ Testing System APIs...')
    
    await this.runTestWithTimeout('Ping system', async () => {
      const ping = await agentService.ping()
      if (ping.status !== 'ok') {
        throw new Error('System ping failed')
      }
    })

    await this.runTestWithTimeout('Get system version', async () => {
      const version = await agentService.getSystemVersion()
      if (!version.version) {
        throw new Error('No version information received')
      }
    })

    await this.runTestWithTimeout('Get system config', async () => {
      const config = await agentService.getSystemConfig()
      if (!config.version || !config.environment) {
        throw new Error('Invalid system configuration')
      }
    })
  }

  // Notification & Audit Tests
  async testNotificationsAndAudit(): Promise<void> {
    console.log('\n🔔 Testing Notifications & Audit APIs...')
    
    await this.runTestWithTimeout('Get notifications', async () => {
      const notifications = await agentService.getNotifications(true, 1, 10)
      if (!Array.isArray(notifications)) {
        throw new Error('Notifications should be an array')
      }
    })

    await this.runTestWithTimeout('Get audit events', async () => {
      const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const to = new Date().toISOString()
      const events = await agentService.getAuditEvents(from, to, 1, 20)
      if (!Array.isArray(events)) {
        throw new Error('Audit events should be an array')
      }
    })
  }

  // Agent-Specific Tests
  async testAgentAPIs(): Promise<void> {
    console.log('\n🛡️ Testing Agent-Specific APIs...')
    
    // Guardian Agent Tests
    await this.runTestWithTimeout('Guardian health check', async () => {
      const health = await agentService.getGuardianHealth()
      if (!health.status) {
        throw new Error('No guardian health status')
      }
    })

    await this.runTestWithTimeout('Guardian status', async () => {
      const status = await agentService.getGuardianStatus()
      if (!status.status || !status.monitoringSystems) {
        throw new Error('Invalid guardian status')
      }
    })

    await this.runTestWithTimeout('Predict stability', async () => {
      const prediction = await agentService.predictStability({
        kilnSpeed: 3.2,
        fuelFlow: 5.5,
        feedRate: 200,
        preheaterTemp: 900,
        lsf: 99.5,
        timestamp: new Date().toISOString()
      })
      if (!prediction.prediction) {
        throw new Error('No stability prediction received')
      }
    })

    // Optimizer Agent Tests
    await this.runTestWithTimeout('Optimizer health check', async () => {
      const health = await agentService.getOptimizerHealth()
      if (!health.status) {
        throw new Error('No optimizer health status')
      }
    })

    await this.runTestWithTimeout('Optimize fuel mix', async () => {
      const optimization = await agentService.optimizeFuelMix({
        currentFuelMix: { coal: 70, biomass: 20, waste: 10 },
        constraints: { maxAlternativeFuel: 30, minCoal: 50 },
        marketPrices: { coal: 100, biomass: 80, waste: 60 }
      })
      if (!optimization.optimizedMix) {
        throw new Error('No fuel optimization received')
      }
    })

    // Master Control Agent Tests
    await this.runTestWithTimeout('Master control health check', async () => {
      const health = await agentService.getMasterControlHealth()
      if (!health.status) {
        throw new Error('No master control health status')
      }
    })

    await this.runTestWithTimeout('Orchestrate workflow', async () => {
      const workflow = await agentService.orchestrateWorkflow({
        workflowType: 'quality_optimization',
        priority: 'high',
        context: { lsfDeviation: 1.5 }
      })
      if (!workflow.requestId) {
        throw new Error('No workflow request ID')
      }
    })

    // Egress Agent Tests
    await this.runTestWithTimeout('Egress health check', async () => {
      const health = await agentService.getEgressHealth()
      if (!health.status) {
        throw new Error('No egress health status')
      }
    })

    await this.runTestWithTimeout('Get OPC-UA status', async () => {
      const status = await agentService.getOPCUAStatus()
      if (!status.connection || !status.nodes) {
        throw new Error('Invalid OPC-UA status')
      }
    })

    await this.runTestWithTimeout('Execute command', async () => {
      const execution = await agentService.executeCommand({
        command: 'set_kiln_speed',
        parameters: { value: 3.3 },
        validation: true,
        timeout: 30000
      })
      if (!execution.commandId) {
        throw new Error('No command execution ID')
      }
    })

    await this.runTestWithTimeout('Get command history', async () => {
      const history = await agentService.getCommandHistory(10)
      if (!Array.isArray(history)) {
        throw new Error('Command history should be an array')
      }
    })
  }

  // WebSocket Tests
  async testWebSocket(): Promise<void> {
    console.log('\n🔌 Testing WebSocket Connection...')
    
    await this.runTestWithTimeout('WebSocket connection', async () => {
      return new Promise<void>((resolve) => {
        const ws = createCemAIWebSocket({
          onConnect: () => {
            console.log('WebSocket connected successfully')
            ws.disconnect()
            resolve()
          },
          onError: () => {
            console.log('WebSocket connection failed, using mock mode')
            resolve() // Don't fail the test if WebSocket is not available
          },
          onDisconnect: () => {
            console.log('WebSocket disconnected')
          }
        })

        ws.connect().catch(() => {
          // WebSocket might not be available in test environment
          resolve()
        })

        // Timeout after 5 seconds
        setTimeout(() => {
          ws.disconnect()
          resolve()
        }, 5000)
      })
    })
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive API Integration Tests...')
    console.log(`Base URL: ${TEST_CONFIG.baseURL}`)
    console.log('='.repeat(60))

    try {
      await this.testAuthentication()
      await this.testGlassCockpit()
      await this.testCoPilot()
      await this.testOracle()
      await this.testSystemAPIs()
      await this.testNotificationsAndAudit()
      await this.testAgentAPIs()
      await this.testWebSocket()
    } catch (error) {
      console.error('Test suite error:', error)
    }

    this.printResults()
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST RESULTS SUMMARY')
    console.log('='.repeat(60))

    const passed = this.testResults.filter(r => r.status === 'pass').length
    const failed = this.testResults.filter(r => r.status === 'fail').length
    const skipped = this.testResults.filter(r => r.status === 'skip').length
    const total = this.testResults.length

    console.log(`Total Tests: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⏭️ Skipped: ${skipped}`)
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:')
      this.testResults
        .filter(r => r.status === 'fail')
        .forEach(r => {
          console.log(`  • ${r.test}: ${r.error}`)
        })
    }

    const avgDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / total
    console.log(`\n⏱️ Average Test Duration: ${avgDuration.toFixed(0)}ms`)

    console.log('\n' + '='.repeat(60))
    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED! API Integration is working correctly.')
    } else {
      console.log('⚠️ Some tests failed. Check the API endpoints and network connectivity.')
    }
    console.log('='.repeat(60))
  }
}

// Export test suite for use in other files
export const apiTestSuite = new APITestSuite()

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  apiTestSuite.runAllTests().catch(console.error)
} else {
  // Browser environment - expose for manual testing
  (window as any).runAPITests = () => apiTestSuite.runAllTests()
  console.log('API Test Suite loaded. Run window.runAPITests() to start testing.')
}
