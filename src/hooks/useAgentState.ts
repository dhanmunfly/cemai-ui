import { useEffect } from 'react'
import { useAgentStore } from '@/services/agentStore'
import { agentService } from '@/api/agentService'

export const useAgentState = (pollMs: number = 5000) => {
  const { kpis, lastUpdated, setKpis } = useAgentStore()

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    const tick = async () => {
      try {
        const data = await agentService.getRealtimeKpis()
        if (!cancelled) setKpis(data)
      } catch (_) {
        // swallow for mock
      } finally {
        if (!cancelled) timer = window.setTimeout(tick, pollMs)
      }
    }

    tick()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [pollMs, setKpis])

  return { kpis, lastUpdated }
}


