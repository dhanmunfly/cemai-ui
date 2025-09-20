import type { KpiMap } from '@/types/kpi'
import type { HealthMap } from '@/types/process'
import type { LogEntry } from '@/types/log'

export const getRealtimeKpis = async (): Promise<KpiMap> => {
  // Mock API response for now
  const now = Date.now()
  return {
    specificPower: {
      id: 'specificPower',
      name: 'Specific Power',
      value: 28.5,
      unit: 'kWh/ton',
      trend: 'up',
      status: 'normal',
      target: { min: 26, max: 30 },
      timestamp: now,
    },
    heatRate: {
      id: 'heatRate',
      name: 'Heat Rate',
      value: 780,
      unit: 'kcal/kg',
      trend: 'stable',
      status: 'normal',
      target: { min: 700, max: 820 },
      timestamp: now,
    },
    clinkerLSF: {
      id: 'clinkerLSF',
      name: 'Clinker LSF',
      value: 96.5,
      unit: '',
      trend: 'down',
      status: 'warning',
      target: { min: 95, max: 98 },
      timestamp: now,
    },
    tsr: {
      id: 'tsr',
      name: 'TSR',
      value: 18,
      unit: '%',
      trend: 'up',
      status: 'normal',
      target: { min: 10, max: 30 },
      timestamp: now,
    },
  }
}

export const getHealthPredictions = async (): Promise<HealthMap> => {
  // Mocked health predictions
  return {
    kiln: { system: 'kiln', status: 'warning', predictionMinutes: 45 },
    cooler: { system: 'cooler', status: 'stable' },
    mill: { system: 'mill', status: 'critical', predictionMinutes: 10 },
  }
}

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


