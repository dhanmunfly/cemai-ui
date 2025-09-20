import { create } from 'zustand'
import type { KpiMap } from '@/types/kpi'

export type AutonomyState = 'on' | 'paused' | 'manual'

interface AgentState {
  // KPIs
  kpis: KpiMap | null
  lastUpdated: number | null
  setKpis: (data: KpiMap) => void

  // Autonomy
  autonomy: AutonomyState
  pauseAutonomy: () => void
  resumeAutonomy: () => void
  setManual: () => void
}

export const useAgentStore = create<AgentState>((set) => ({
  // KPIs
  kpis: null,
  lastUpdated: null,
  setKpis: (data) => set({ kpis: data, lastUpdated: Date.now() }),

  // Autonomy
  autonomy: 'on',
  pauseAutonomy: () => set({ autonomy: 'paused' }),
  resumeAutonomy: () => set({ autonomy: 'on' }),
  setManual: () => set({ autonomy: 'manual' }),
}))


