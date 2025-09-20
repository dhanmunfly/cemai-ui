import React from 'react'
import type { HealthPrediction } from '@/types/process'

type Props = { prediction: HealthPrediction }

const statusStyle: Record<HealthPrediction['status'], string> = {
  stable: 'bg-green-500',
  warning: 'bg-amber-500 animate-pulse-slow',
  critical: 'bg-red-500 animate-pulse',
}

const label: Record<HealthPrediction['system'], string> = {
  kiln: 'Kiln',
  cooler: 'Cooler',
  mill: 'Mill',
}

const HealthGlyph: React.FC<Props> = ({ prediction }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-md border border-white/10 bg-black/20 text-white">
      <div className={`h-4 w-4 rounded-full ${statusStyle[prediction.status]}`} />
      <div className="text-sm">
        <div className="font-medium">{label[prediction.system]}</div>
        {prediction.predictionMinutes ? (
          <div className="text-xs opacity-70">{prediction.predictionMinutes} min</div>
        ) : (
          <div className="text-xs opacity-50">Stable</div>
        )}
      </div>
    </div>
  )
}

export default HealthGlyph


