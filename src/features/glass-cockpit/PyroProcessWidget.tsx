import React, { useEffect, useState } from 'react'
import { getHealthPredictions } from '@/api/agentService'
import type { HealthMap } from '@/types/process'
import HealthGlyph from '@/components/shared/HealthGlyph'

const PyroProcessWidget: React.FC = () => {
  const [health, setHealth] = useState<HealthMap | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    const load = async () => {
      const data = await getHealthPredictions()
      if (!cancelled) setHealth(data)
      if (!cancelled) timer = window.setTimeout(load, 10000)
    }
    load()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="p-4 rounded-md border border-white/10 bg-black/30 text-white">
      <div className="mb-3 text-sm font-semibold">Pyro-Process Stability</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {health && (
          <>
            <HealthGlyph prediction={health.kiln} />
            <HealthGlyph prediction={health.cooler} />
            <HealthGlyph prediction={health.mill} />
          </>
        )}
      </div>
    </div>
  )
}

export default PyroProcessWidget


