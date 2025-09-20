export type LogAgent = 'guardian' | 'optimizer' | 'master'
export type LogLevel = 'info' | 'warning' | 'error'

export interface LogEntry {
  id: string
  timestamp: number
  agent: LogAgent
  level: LogLevel
  message: string
}


