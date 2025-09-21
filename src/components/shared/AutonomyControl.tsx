import React from 'react'
import { useAgentStore, type AutonomyState } from '@/services/agentStore'
import { useToast } from '@/components/shared/ToastProvider'
import { useUiStore } from '@/services/uiStore'
import { agentService } from '@/api/agentService'

const stateStyle: Record<AutonomyState, string> = {
  on: 'bg-green-600 hover:bg-green-500',
  paused: 'bg-amber-600 hover:bg-amber-500 animate-pulse',
  manual: 'bg-red-600 hover:bg-red-500',
}

const label: Record<AutonomyState, string> = {
  on: 'AUTONOMY: ON',
  paused: 'AUTONOMY: PAUSED',
  manual: 'AUTONOMY: MANUAL',
}

const AutonomyControl: React.FC = () => {
  const autonomy = useAgentStore((s) => s.autonomy)
  const pause = useAgentStore((s) => s.pauseAutonomy)
  const resume = useAgentStore((s) => s.resumeAutonomy)
  const manual = useAgentStore((s) => s.setManual)
  const { addToast } = useToast()
  const role = useUiStore((s) => s.role)

  const clickHandler = async () => {
    if (role !== 'operator') { 
      addToast({ message: 'Insufficient permissions', variant: 'error' })
      return 
    }
    
    try {
      if (autonomy === 'on') { 
        await agentService.pauseAutonomy('Manual pause by operator')
        pause()
        addToast({ message: 'Autonomy paused', variant: 'warning' }) 
      }
      else if (autonomy === 'paused') { 
        await agentService.resumeAutonomy()
        resume()
        addToast({ message: 'Autonomy resumed', variant: 'success' }) 
      }
      else if (autonomy === 'manual') { 
        await agentService.resumeAutonomy()
        resume()
        addToast({ message: 'Autonomy enabled', variant: 'success' }) 
      }
    } catch (error) {
      console.error('Autonomy control failed:', error)
      addToast({ message: 'Failed to change autonomy state', variant: 'error' })
    }
  }

  const handleManualMode = async () => {
    if (role !== 'operator') { 
      addToast({ message: 'Insufficient permissions', variant: 'error' })
      return 
    }
    
    try {
      await agentService.setManualMode('Manual mode activated by operator')
      manual()
      addToast({ message: 'Manual mode enabled', variant: 'error' })
    } catch (error) {
      console.error('Manual mode activation failed:', error)
      addToast({ message: 'Failed to activate manual mode', variant: 'error' })
    }
  }

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        clickHandler()
      }
      if (e.key.toLowerCase() === 'm') { 
        handleManualMode()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [autonomy])

  return (
    <div className="flex items-center gap-3">
      <button
        className={`text-white px-4 py-2 rounded-md font-semibold ${stateStyle[autonomy]}`}
        onClick={clickHandler}
        title="Toggle autonomy (Space)"
      >
        {label[autonomy]}
      </button>
      <button
        className="px-3 py-2 rounded-md border border-white/20 text-white/90 hover:bg-white/10"
        onClick={handleManualMode}
        title="Switch to manual control"
      >
        Manual
      </button>
    </div>
  )
}

export default AutonomyControl


