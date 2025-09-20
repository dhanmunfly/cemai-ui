export type ProcessSystem = 'kiln' | 'cooler' | 'mill'

export type HealthStatus = 'stable' | 'warning' | 'critical'

export interface HealthPrediction {
  system: ProcessSystem
  status: HealthStatus
  predictionMinutes?: number
}

export type HealthMap = Record<ProcessSystem, HealthPrediction>


