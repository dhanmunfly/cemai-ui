import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { LogEntry } from '@/types/log'
import { streamControlLog } from '@/api/agentService'

const agentColor: Record<LogEntry['agent'], string> = {
  guardian: 'text-blue-400',
  optimizer: 'text-green-400',
  master: 'text-amber-400 font-semibold',
}

const levelBadge: Record<LogEntry['level'], string> = {
  info: 'text-white/80',
  warning: 'text-amber-300',
  error: 'text-red-400',
}

const MasterControlLog: React.FC = () => {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stop = streamControlLog((e) => {
      setEntries((prev) => [...prev.slice(-199), e])
    })
    return () => stop()
  }, [])

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight })
  }, [entries])

  const rows = useMemo(() => entries.map((e) => (
    <div key={e.id} className="font-mono text-xs whitespace-pre">
      <span className="text-white/40">{new Date(e.timestamp).toLocaleTimeString()} </span>
      <span className={agentColor[e.agent]}>[{e.agent.toUpperCase()}]</span>
      <span className="mx-1">-</span>
      <span className={levelBadge[e.level]}>{e.message}</span>
    </div>
  )), [entries])

  return (
    <div className="p-4 rounded-md border border-white/10 bg-black/50 text-white">
      <div className="mb-2 text-sm font-semibold">Master Control Log</div>
      <div ref={containerRef} className="h-64 overflow-auto custom-scrollbar">
        {rows}
      </div>
    </div>
  )
}

export default MasterControlLog


