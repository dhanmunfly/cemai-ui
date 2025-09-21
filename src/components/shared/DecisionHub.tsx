import React from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/shared/ToastProvider'
import type { Proposal, DecisionPayload } from '@/types/decision'
import { useAgentStore } from '@/services/agentStore'
import { agentService } from '@/api/agentService'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  decision: DecisionPayload
  onApprove: () => void
  onReject: () => void
}

const Panel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-md border border-white/10 bg-black/40 p-4">
    <div className="mb-2 text-sm font-semibold">{title}</div>
    <div className="text-sm text-white/90">
      {children}
    </div>
  </div>
)

const ProposalView: React.FC<{ proposal: Proposal; color: string }> = ({ proposal, color }) => (
  <div>
    <div className={`mb-1 font-medium ${color}`}>{proposal.title}</div>
    <div className="mb-2 text-white/80">{proposal.description}</div>
    <div className="text-xs mb-2">
      <div className="opacity-70 mb-1">Adjustments</div>
      {Object.entries(proposal.adjustments).map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <span className="opacity-70">{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
    <div className="text-xs">
      <div className="opacity-70 mb-1">Predicted Impact</div>
      {Object.entries(proposal.predictedImpact).map(([k, v]) => (
        <div key={k} className="flex justify-between">
          <span className="opacity-70">{k}</span>
          <span>{v}</span>
        </div>
      ))}
    </div>
  </div>
)

const DecisionHub: React.FC<Props> = ({ open, onOpenChange, decision, onApprove, onReject }) => {
  const autonomy = useAgentStore((s) => s.autonomy)
  const { addToast } = useToast()
  const dialogRef = React.useRef<HTMLDivElement | null>(null)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)
  const titleId = 'decision-hub-title'
  const descId = 'decision-hub-desc'

  const handleApprove = async () => {
    try {
      await agentService.approveDecision(decision.id, 'Approved by operator via Decision Hub')
      addToast({ message: 'Decision approved', variant: 'success' })
      onApprove()
    } catch (error) {
      console.error('Decision approval failed:', error)
      addToast({ message: 'Failed to approve decision', variant: 'error' })
    }
  }

  const handleReject = async () => {
    try {
      await agentService.rejectDecision(decision.id, 'Rejected by operator via Decision Hub')
      addToast({ message: 'Decision rejected', variant: 'warning' })
      onReject()
    } catch (error) {
      console.error('Decision rejection failed:', error)
      addToast({ message: 'Failed to reject decision', variant: 'error' })
    }
  }

  // Focus management & ESC to close
  React.useEffect(() => {
    if (open) {
      previouslyFocused.current = (document.activeElement as HTMLElement) ?? null
      // Focus first focusable inside dialog
      setTimeout(() => {
        const el = dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        el?.focus()
      }, 0)
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          onOpenChange(false)
        }
        if (e.key === 'Tab' && dialogRef.current) {
          const focusables = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((n) => !n.hasAttribute('disabled'))
          if (focusables.length === 0) return
          const first = focusables[0]
          const last = focusables[focusables.length - 1]
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        }
      }
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus()
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={() => onOpenChange(false)} />
      <div ref={dialogRef} className="relative w-[90vw] max-w-6xl max-h-[80vh] overflow-auto rounded-lg border border-[rgb(var(--color-border))]/40 bg-[rgb(var(--color-surface))] p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div id={titleId} className="text-lg font-semibold">Decision Hub</div>
          <div className="text-xs opacity-70">Autonomy: {autonomy.toUpperCase()}</div>
        </div>
        <div id={descId} className="sr-only">Review and approve or reject AI proposals with master synthesis</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <Panel title="Guardian Proposal">
            <ProposalView proposal={decision.guardian} color="text-blue-400" />
          </Panel>
          <Panel title="Master Synthesis & Reasoning">
            <div className="text-white/90 mb-2">{decision.synthesis.summary}</div>
            <div className="text-white/70 mb-3 text-sm">{decision.synthesis.rationale}</div>
            <div className="text-xs">
              <div className="opacity-70 mb-1">Recommended Adjustments</div>
              {Object.entries(decision.synthesis.recommendedAdjustments).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="opacity-70">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Optimizer Proposal">
            <ProposalView proposal={decision.optimizer} color="text-green-400" />
          </Panel>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleReject}>Reject & Re-plan</Button>
          <Button onClick={handleApprove}>Approve & Execute</Button>
        </div>
      </div>
    </div>
  )
}

export default DecisionHub


