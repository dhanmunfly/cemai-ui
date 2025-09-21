import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatMessage } from '@/types/chat'
import { useAgentStore } from '@/services/agentStore'
import { agentService } from '@/api/agentService'

const Bubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${isUser ? 'bg-blue-600' : 'bg-white/10'} text-white`}> 
        {msg.content}
        <div className="mt-1 text-[10px] opacity-50">
          {new Date(msg.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}

const OracleChat: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: 's1', role: 'system', content: 'Oracle ready. Ask me anything about plant operations.', timestamp: Date.now() },
  ])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const autonomy = useAgentStore((s) => s.autonomy)
  const [warnButtons, setWarnButtons] = React.useState<string[]>([])

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return
    
    const now = Date.now()
    const userMsg: ChatMessage = { id: `u-${now}`, role: 'user', content: text, timestamp: now }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    
    try {
      // Get current KPIs for context
      const kpis = await agentService.getRealtimeKpis()
      const context = {
        currentKPIs: {
          specificPower: kpis.specificPower.value,
          heatRate: kpis.heatRate.value,
          clinkerLSF: kpis.clinkerLSF.value,
          tsr: kpis.tsr.value,
        },
        autonomy: autonomy,
      }
      
      const response = await agentService.sendChatMessage(text, context)
      
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, reply])
      
      // Update suggestions if provided
      if (response.suggestions && response.suggestions.length > 0) {
        setWarnButtons(response.suggestions)
      }
    } catch (error) {
      console.error('Chat message failed:', error)
      const errorReply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorReply])
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  React.useEffect(() => {
    let cancelled = false
    const update = async () => {
      try {
        const health = await agentService.getHealthPredictions()
        const anyWarn = Object.values(health).some(h => h.status !== 'stable')
        
        if (!cancelled) {
          if (anyWarn) {
            // Get context-aware suggestions
            const suggestions = await agentService.getChatSuggestions('System health warnings detected')
            setWarnButtons(suggestions)
          } else {
            setWarnButtons([])
          }
        }
      } catch (error) {
        console.error('Failed to update chat suggestions:', error)
        if (!cancelled) {
          setWarnButtons([])
        }
      }
    }
    update()
    const id = window.setInterval(update, 10000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [])

  return (
    <div className="flex flex-col h-96 rounded-md border border-white/10 bg-black/40 text-white">
      <div className="px-4 py-2 text-sm font-semibold border-b border-white/10">Oracle Assistant</div>
      {(autonomy === 'paused' || warnButtons.length > 0) && (
        <div className="px-4 py-2 flex gap-2 flex-wrap border-b border-white/10">
          {(warnButtons.length ? warnButtons : ['Show SOP for LSF deviation','Raw mix parameters 1h ago','Plot kiln temperature vs fuel rate (3h)']).map((b) => (
            <Button key={b} size="sm" variant="outline" onClick={() => send(b)} className="rounded-full">
              <span className="text-xs">{b}</span>
            </Button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl px-3 py-2 text-sm text-white">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Oracle is thinking...
              </div>
            </div>
          </div>
        )}
      </div>
      <form
        className="p-2 flex items-center gap-2 border-t border-white/10"
        onSubmit={(e) => { e.preventDefault(); send(input) }}
      >
        <Input
          className="flex-1"
          placeholder="Ask Oracle... (Enter to send, Shift+Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.shiftKey) return
            if (e.key === 'Enter') {
              e.preventDefault()
              send(input)
            }
          }}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
  )
}

export default OracleChat


