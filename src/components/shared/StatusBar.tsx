import React from 'react'
import { useAgentStore } from '@/services/agentStore'
import { useUiStore } from '@/services/uiStore'
import { useTheme } from '@/components/shared/ThemeProvider'

const Dot: React.FC<{ ok: boolean }> = ({ ok }) => (
  <span className={`inline-block h-2 w-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
)

const StatusBar: React.FC = () => {
  const lastUpdated = useAgentStore((s) => s.lastUpdated)
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null)
  const [connected, setConnected] = React.useState(true)
  const role = useUiStore((s) => s.role)
  const setRole = useUiStore((s) => s.setRole)
  const { theme, toggle } = useTheme()

  React.useEffect(() => {
    let cancelled = false
    const ping = async () => {
      const start = performance.now()
      try {
        // Simulate ping endpoint
        await new Promise((r) => setTimeout(r, 80 + Math.random() * 120))
        if (!cancelled) setLatencyMs(Math.round(performance.now() - start))
        if (!cancelled) setConnected(true)
      } catch (_) {
        if (!cancelled) setConnected(false)
      }
    }
    const id = window.setInterval(ping, 5000)
    ping()
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="text-xs text-white/70">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Dot ok={connected} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="opacity-80">Latency: {latencyMs ?? '—'} ms</div>
        <div className="opacity-80">Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}</div>
        <label className="flex items-center gap-2">
          <span className="opacity-70">Role</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="bg-black/40 border border-white/20 text-white rounded px-2 py-1"
          >
            <option value="operator">Operator</option>
            <option value="manager">Manager</option>
            <option value="engineer">Engineer</option>
          </select>
        </label>
        <button onClick={toggle} className="px-2 py-1 rounded border border-white/20 hover:bg-white/10">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      {!connected && (
        <div className="mt-2 text-[11px] text-red-300 bg-red-900/30 border border-red-800 rounded px-2 py-1 inline-block">
          Connection lost. Attempting to reconnect...
        </div>
      )}
    </div>
  )
}

export default StatusBar


