export type KpiTrend = 'up' | 'down' | 'stable'

export type KpiStatus = 'normal' | 'warning' | 'critical' | 'offline'

export type KpiId = 'specificPower' | 'heatRate' | 'clinkerLSF' | 'tsr'

export interface KpiTargetRange {
  min: number
  max: number
}

export interface KpiData {
  id: KpiId
  name: string
  value: number
  unit: string
  trend: KpiTrend
  status: KpiStatus
  target: KpiTargetRange
  timestamp: number
}

export type KpiMap = Record<KpiId, KpiData>


