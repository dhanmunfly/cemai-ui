import React from 'react'
import { useAgentState } from '@/hooks/useAgentState'
import KpiCard from '@/components/shared/KpiCard'
import { Skeleton } from '@/components/shared/Skeleton'
import PyroProcessWidget from '@/features/glass-cockpit/PyroProcessWidget'
import MasterControlLog from '@/components/shared/MasterControlLog'
import AutonomyControl from '@/components/shared/AutonomyControl'
import DecisionHub from '@/components/shared/DecisionHub'
import type { DecisionPayload } from '@/types/decision'
import OracleChat from '@/components/shared/OracleChat'
import Sidebar from '@/components/shared/Sidebar'
import StatusBar from '@/components/shared/StatusBar'
import { agentService } from '@/api/agentService'
import { useToast } from '@/components/shared/ToastProvider'
import { useAgentStore } from '@/services/agentStore'

const DashboardPage: React.FC = () => {
  const { kpis } = useAgentState(5000)
  const autonomy = useAgentStore((state) => state.autonomy)
  const [hubOpen, setHubOpen] = React.useState(false)
  const [pendingDecision, setPendingDecision] = React.useState<DecisionPayload | null>(null)
  const [isUsingMockData, setIsUsingMockData] = React.useState(false)
  const { addToast } = useToast()

  // Check if we're using mock data
  React.useEffect(() => {
    const checkMockDataStatus = async () => {
      try {
        // Try to make a simple API call to check if we're using mock data
        await agentService.ping()
        setIsUsingMockData(false)
      } catch (error) {
        setIsUsingMockData(true)
      }
    }
    checkMockDataStatus()
  }, [])

  // Load pending decisions
  React.useEffect(() => {
    const loadPendingDecisions = async () => {
      try {
        const decisions = await agentService.getPendingDecisions()
        if (decisions.length > 0) {
          const decision = decisions[0]
          setPendingDecision(decision)
          
          // Check autonomy state
          if (autonomy === 'on') {
            // Auto mode: Automatically approve the decision
            console.log('Auto mode: Automatically approving decision', decision.id)
            await agentService.approveDecision(decision.id, 'Auto-approved by AI system')
            addToast({ 
              message: `Decision ${decision.id} auto-approved by AI system`, 
              variant: 'success' 
            })
            setPendingDecision(null)
            setHubOpen(false)
          } else {
            // Manual mode: Show popup for operator approval
            console.log('Manual mode: Showing decision popup for operator approval')
            setHubOpen(true)
          }
        }
      } catch (error) {
        console.error('Failed to load pending decisions:', error)
        addToast({ message: 'Failed to load pending decisions', variant: 'error' })
      }
    }

    loadPendingDecisions()
    
    // Poll for new pending decisions
    const interval = setInterval(loadPendingDecisions, 3000)
    return () => clearInterval(interval)
  }, [autonomy]) // Add autonomy as dependency

  const handleDecisionApproved = () => {
    setHubOpen(false)
    setPendingDecision(null)
    addToast({ message: 'Decision approved and executed', variant: 'success' })
  }

  const handleDecisionRejected = () => {
    setHubOpen(false)
    setPendingDecision(null)
    addToast({ message: 'Decision rejected, new plan will be generated', variant: 'warning' })
  }

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // H: open decision hub
      if (e.key.toLowerCase() === 'h') {
        if (pendingDecision) {
          setHubOpen(true)
        } else {
          addToast({ message: 'No pending decisions available', variant: 'info' })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pendingDecision])

  return (
    <div className="p-0 text-white">
      <Sidebar />
      
      {/* Mock Data Indicator */}
      {isUsingMockData && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
          🎭 Demo Mode - Using Mock Data for Demonstration
        </div>
      )}
      
      <div className={`sticky top-0 z-40 backdrop-blur border-b pl-[var(--sidebar-w,16rem)] pr-6 py-3 bg-[rgb(var(--color-surface))]/70 border-[rgb(var(--color-border))]/40 ${isUsingMockData ? 'mt-8' : ''}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">CemAI Control Tower</h1>
          <div className="flex items-center gap-3">
          <AutonomyControl />
          <button
            className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/10 disabled:opacity-50"
            onClick={() => setHubOpen(true)}
            disabled={!pendingDecision}
            title="Open Decision Hub (H)"
          >
            Open Decision Hub {pendingDecision && '(Pending)'}
          </button>
          <a
            className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/10"
            href="/history"
          >
            Decision History
          </a>
          </div>
        </div>
        <div className="mt-2">
          <StatusBar />
        </div>
      </div>
      <div className="pr-6 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-all" style={{ paddingLeft: 'var(--sidebar-w,16rem)' }}>
        {!kpis && (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        )}
        {kpis && (
          <>
            <KpiCard kpi={kpis.specificPower} />
            <KpiCard kpi={kpis.heatRate} />
            <KpiCard kpi={kpis.clinkerLSF} />
            <KpiCard kpi={kpis.tsr} />
          </>
        )}
      </div>
      <div className="pr-6 grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ paddingLeft: 'var(--sidebar-w,16rem)' }}>
        <PyroProcessWidget />
        <MasterControlLog />
      </div>
      <div className="pr-6 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8" style={{ paddingLeft: 'var(--sidebar-w,16rem)' }}>
        <OracleChat />
      </div>
      {pendingDecision && (
        <DecisionHub
          open={hubOpen}
          onOpenChange={setHubOpen}
          decision={pendingDecision}
          onApprove={handleDecisionApproved}
          onReject={handleDecisionRejected}
        />
      )}
    </div>
  )
}

export default DashboardPage


