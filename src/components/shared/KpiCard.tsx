import React from 'react'
import type { KpiData } from '@/types/kpi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusClass: Record<KpiData['status'], string> = {
  normal: 'border-green-500 text-green-400',
  warning: 'border-amber-500 text-amber-400',
  critical: 'border-red-500 text-red-400',
  offline: 'border-gray-500 text-gray-400',
}

const trendSymbol: Record<KpiData['trend'], string> = {
  up: '▲',
  down: '▼',
  stable: '■',
}

type Props = { kpi: KpiData }

const KpiCard: React.FC<Props> = ({ kpi }) => {
  return (
    <Card data-testid="kpi-card" className={statusClass[kpi.status]}>
      <CardHeader>
        <CardTitle className="opacity-80">{kpi.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-3xl font-semibold">{kpi.value}</div>
          <div className="opacity-70">{kpi.unit}</div>
          <div className="ml-auto opacity-70">{trendSymbol[kpi.trend]}</div>
        </div>
        <div className="mt-2 text-xs opacity-70">Target: {kpi.target.min} - {kpi.target.max}</div>
      </CardContent>
    </Card>
  )
}

export default KpiCard


