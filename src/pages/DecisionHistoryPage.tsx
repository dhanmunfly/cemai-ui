import React from 'react'
import type { Proposal, MasterSynthesis } from '@/types/decision'
import { Input } from '@/components/ui/input'
import Sidebar from '@/components/shared/Sidebar'

type HistoryItem = {
  id: string
  timestamp: number
  guardian: Proposal
  optimizer: Proposal
  synthesis: MasterSynthesis
  status: 'approved' | 'rejected'
}

const mockHistory: HistoryItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `d-${i + 1}`,
  timestamp: Date.now() - i * 3600_000,
  status: Math.random() > 0.3 ? 'approved' : 'rejected',
  guardian: {
    id: `g-${i + 1}`,
    agent: 'guardian',
    title: 'Stability-first: LSF control',
    description: 'Keep LSF in range using raw mix adjustment.',
    adjustments: { rawMix: -0.5 },
    predictedImpact: { LSF: -0.3 },
    confidence: 0.84,
  },
  optimizer: {
    id: `o-${i + 1}`,
    agent: 'optimizer',
    title: 'Cost-first: RDF +1%',
    description: 'Increase RDF to improve cost efficiency.',
    adjustments: { RDF: 1.0 },
    predictedImpact: { savingsPerHourUSD: 150 },
    confidence: 0.76,
  },
  synthesis: {
    summary: 'Compromise +0.8% RDF',
    rationale: 'Balance savings with stability risk.',
    recommendedAdjustments: { RDF: 0.8 },
  },
}))

const Badge: React.FC<{ status: HistoryItem['status'] }> = ({ status }) => (
  <span className={`px-2 py-0.5 rounded text-xs ${status === 'approved' ? 'bg-green-600' : 'bg-red-600'}`}>
    {status.toUpperCase()}
  </span>
)

const DecisionHistoryPage: React.FC = () => {
  const [query, setQuery] = React.useState('')
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  const filtered = mockHistory.filter((h) =>
    h.guardian.title.toLowerCase().includes(query.toLowerCase()) ||
    h.optimizer.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-0 text-white">
      <Sidebar />
      <div className="pr-6 pt-6" style={{ paddingLeft: 'var(--sidebar-w,16rem)' }}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Decision History</h1>
        <Input
          placeholder="Search decisions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-md border border-white/10 bg-black/40">
            <button
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5"
              onClick={() => setExpanded((s) => ({ ...s, [item.id]: !s[item.id] }))}
            >
              <div className="text-sm opacity-70 w-40">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div className="text-sm flex-1">
                {item.guardian.title} vs {item.optimizer.title}
              </div>
              <Badge status={item.status} />
            </button>
            {expanded[item.id] && (
              <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs opacity-70 mb-1">Guardian</div>
                  <div className="text-sm">{item.guardian.description}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">Master Synthesis</div>
                  <div className="text-sm mb-1">{item.synthesis.summary}</div>
                  <div className="text-xs opacity-80">{item.synthesis.rationale}</div>
                </div>
                <div>
                  <div className="text-xs opacity-70 mb-1">Optimizer</div>
                  <div className="text-sm">{item.optimizer.description}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}

export default DecisionHistoryPage


