import React from 'react'
import { useAgentState } from '@/hooks/useAgentState'
import KpiCard from '@/components/shared/KpiCard'
import { Skeleton } from '@/components/shared/Skeleton'
import PyroProcessWidget from '@/features/glass-cockpit/PyroProcessWidget'
import MasterControlLog from '@/components/shared/MasterControlLog'
import AutonomyControl from '@/components/shared/AutonomyControl'
import DecisionHub from '@/components/shared/DecisionHub'
import type { Proposal, MasterSynthesis } from '@/types/decision'
import OracleChat from '@/components/shared/OracleChat'
import Sidebar from '@/components/shared/Sidebar'
import StatusBar from '@/components/shared/StatusBar'

const DashboardPage: React.FC = () => {
  const { kpis } = useAgentState(5000)
  const [hubOpen, setHubOpen] = React.useState(false)

  // Mock data for hub
  const guardian: Proposal = {
    id: 'g1',
    agent: 'guardian',
    title: 'Stability-first: Reduce Raw Mix Variability',
    description: 'Adjust raw mix feed ±0.5% to keep LSF within 95-98 window.',
    adjustments: { rawMix: -0.5 },
    predictedImpact: { LSF: -0.4 },
    confidence: 0.86,
  }
  const optimizer: Proposal = {
    id: 'o1',
    agent: 'optimizer',
    title: 'Cost-first: Increase RDF by 1.5%',
    description: 'Increase RDF substitution to save fuel cost.',
    adjustments: { RDF: 1.5 },
    predictedImpact: { savingsPerHourUSD: 210 },
    confidence: 0.78,
  }
  const synthesis: MasterSynthesis = {
    summary: 'Adopt +1.0% RDF to capture savings while staying stable.',
    rationale: 'Full +1.5% risks temp drop. Compromise at +1.0% mitigates risk.',
    recommendedAdjustments: { RDF: 1.0 },
  }

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // H: open decision hub
      if (e.key.toLowerCase() === 'h') {
        setHubOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="p-0 text-white">
      <Sidebar />
      <div className="sticky top-0 z-40 backdrop-blur border-b pl-[var(--sidebar-w,16rem)] pr-6 py-3 bg-[rgb(var(--color-surface))]/70 border-[rgb(var(--color-border))]/40">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">CemAI Control Tower</h1>
          <div className="flex items-center gap-3">
          <AutonomyControl />
          <button
            className="px-3 py-2 rounded-md border border-white/20 hover:bg-white/10"
            onClick={() => setHubOpen(true)}
            title="Open Decision Hub (H)"
          >
            Open Decision Hub
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
      <DecisionHub
        open={hubOpen}
        onOpenChange={setHubOpen}
        guardian={guardian}
        optimizer={optimizer}
        synthesis={synthesis}
        onApprove={() => setHubOpen(false)}
        onReject={() => setHubOpen(false)}
      />
    </div>
  )
}

export default DashboardPage


