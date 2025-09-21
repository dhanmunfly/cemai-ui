import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { agentService } from '@/api/agentService'
import { authService } from '@/api/authService'

interface TestResult {
  test: string
  status: 'pass' | 'fail' | 'running'
  error?: string
  duration?: number
}

export const APIIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<void>) => {
    const startTime = Date.now()
    
    setTestResults(prev => [...prev, { test: testName, status: 'running' }])
    
    try {
      await testFn()
      setTestResults(prev => 
        prev.map(r => 
          r.test === testName 
            ? { test: testName, status: 'pass' as const, duration: Date.now() - startTime }
            : r
        )
      )
    } catch (error) {
      setTestResults(prev => 
        prev.map(r => 
          r.test === testName 
            ? { 
                test: testName, 
                status: 'fail' as const, 
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
              }
            : r
        )
      )
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    // Authentication Tests
    await runTest('Login', async () => {
      await authService.login({ email: 'operator@cemai.com', password: 'password123' })
    })

    await runTest('Get Current User', async () => {
      await authService.getCurrentUser()
    })

    // Glass Cockpit Tests
    await runTest('Get Real-time KPIs', async () => {
      const kpis = await agentService.getRealtimeKpis()
      if (!kpis.specificPower || !kpis.heatRate) {
        throw new Error('Missing KPI data')
      }
    })

    await runTest('Get Health Predictions', async () => {
      const predictions = await agentService.getHealthPredictions()
      if (!predictions.kiln || !predictions.cooler) {
        throw new Error('Missing health predictions')
      }
    })

    // Co-Pilot Tests
    await runTest('Get Agent State', async () => {
      const state = await agentService.getAgentState()
      if (!state.autonomy) {
        throw new Error('Missing agent state')
      }
    })

    await runTest('Get Pending Decisions', async () => {
      const decisions = await agentService.getPendingDecisions()
      if (!Array.isArray(decisions)) {
        throw new Error('Decisions should be an array')
      }
    })

    // Oracle Tests
    await runTest('Send Chat Message', async () => {
      const response = await agentService.sendChatMessage('Test message')
      if (!response.message) {
        throw new Error('No chat response')
      }
    })

    // System Tests
    await runTest('Ping System', async () => {
      const ping = await agentService.ping()
      if (ping.status !== 'ok') {
        throw new Error('System ping failed')
      }
    })

    await runTest('Get System Version', async () => {
      const version = await agentService.getSystemVersion()
      if (!version.version) {
        throw new Error('No version info')
      }
    })

    // Notifications
    await runTest('Get Notifications', async () => {
      const notifications = await agentService.getNotifications()
      if (!Array.isArray(notifications)) {
        throw new Error('Notifications should be an array')
      }
    })

    // Agent Health Checks
    await runTest('Guardian Health', async () => {
      const health = await agentService.getGuardianHealth()
      if (!health.status) {
        throw new Error('No guardian health status')
      }
    })

    await runTest('Optimizer Health', async () => {
      const health = await agentService.getOptimizerHealth()
      if (!health.status) {
        throw new Error('No optimizer health status')
      }
    })

    await runTest('Master Control Health', async () => {
      const health = await agentService.getMasterControlHealth()
      if (!health.status) {
        throw new Error('No master control health status')
      }
    })

    await runTest('Egress Health', async () => {
      const health = await agentService.getEgressHealth()
      if (!health.status) {
        throw new Error('No egress health status')
      }
    })

    setIsRunning(false)
  }

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">✅ Pass</Badge>
      case 'fail':
        return <Badge variant="destructive">❌ Fail</Badge>
      case 'running':
        return <Badge variant="secondary">⏳ Running</Badge>
    }
  }

  const passedTests = testResults.filter(r => r.status === 'pass').length
  const failedTests = testResults.filter(r => r.status === 'fail').length
  const totalTests = testResults.length

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Integration Test Suite</CardTitle>
        <CardDescription>
          Test all API endpoints from the CemAI Agents Postman collection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>

        {totalTests > 0 && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-green-700">Passed</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalTests}</div>
              <div className="text-sm text-blue-700">Total</div>
            </div>
          </div>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    {result.error && (
                      <div className="text-sm text-red-600 mt-1">{result.error}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.duration && (
                      <span className="text-sm text-gray-500">
                        {result.duration}ms
                      </span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalTests > 0 && !isRunning && (
          <div className="text-center">
            <div className="text-lg font-semibold">
              Success Rate: {totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%
            </div>
            {failedTests === 0 ? (
              <div className="text-green-600 font-medium">🎉 All tests passed!</div>
            ) : (
              <div className="text-orange-600 font-medium">
                ⚠️ Some tests failed. Check API connectivity.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
