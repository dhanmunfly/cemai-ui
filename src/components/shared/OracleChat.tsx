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
    { 
      id: 's1', 
      role: 'system', 
      content: '🧠 Oracle AI Assistant ready. I can help you with plant operations, SOPs, troubleshooting, and optimization insights. What would you like to know?', 
      timestamp: Date.now() 
    },
  ])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const autonomy = useAgentStore((s) => s.autonomy)
  const [warnButtons, setWarnButtons] = React.useState<string[]>([])

  // Enhanced mock responses for better demonstration
  const getMockResponse = (userInput: string, context: any): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('lsf') || input.includes('lime saturation')) {
      return `📊 **Current LSF Status**: ${context.currentKPIs.clinkerLSF}

**Analysis**: LSF is within acceptable range (95-98) but trending slightly high. 

**Recommendations**:
• Monitor kiln feed chemistry closely
• Consider adjusting limestone/clay ratio if trend continues
• Check preheater calcination efficiency

**SOP Reference**: LSF Control Procedure SOP-2024-001`
    }
    
    if (input.includes('kiln') && (input.includes('temp') || input.includes('temperature'))) {
      return `🔥 **Kiln Temperature Analysis**

**Current Status**: Temperature zones are stable
• Burning zone: ~1450°C (optimal)
• Transition zone: ~1200°C
• Calcination zone: ~900°C

**Optimization Opportunities**:
• Consider increasing alternative fuel ratio to 15% for cost savings
• Monitor NOx emissions with temperature adjustments
• Check refractory condition in burning zone

**Alert**: Guardian agent recommends monitoring temperature stability due to recent fluctuations.`
    }
    
    if (input.includes('power') || input.includes('energy')) {
      return `⚡ **Power Consumption Analysis**

**Current Specific Power**: ${context.currentKPIs.specificPower} kWh/t

**Performance Metrics**:
• Mill efficiency: 85% (target: 90%)
• Fan power consumption: Normal
• Grinding efficiency: Good

**Optimization Suggestions**:
• Mill load balancing could reduce power by 2-3%
• Variable frequency drives on fans could save 5-8%
• Process optimization potential: $15,000/month savings

**Next Steps**: Review mill operating parameters and consider maintenance schedule.`
    }
    
    if (input.includes('fuel') || input.includes('optimization')) {
      return `⛽ **Fuel Optimization Analysis**

**Current Heat Rate**: ${context.currentKPIs.heatRate} kcal/kg

**Optimization Opportunities**:
• Alternative fuel ratio: Currently 12%, can increase to 15%
• Expected savings: $2,500/day
• CO₂ reduction: 8% with higher alternative fuel

**Constraints**:
• Maintain clinker quality standards
• Ensure stable kiln operation
• Monitor emissions compliance

**Recommendation**: Optimizer agent suggests gradual increase to 15% alternative fuel over next 24 hours.`
    }
    
    if (input.includes('help') || input.includes('what can you do')) {
      return `🤖 **Oracle AI Capabilities**

I can help you with:

**📊 Process Monitoring**
• KPI analysis and trends
• Quality parameter interpretation
• Performance optimization

**🔧 Troubleshooting**
• Process deviation analysis
• Equipment health insights
• Root cause analysis

**📋 SOPs & Procedures**
• Standard operating procedures
• Maintenance schedules
• Safety protocols

**💡 Optimization**
• Cost reduction opportunities
• Efficiency improvements
• Predictive maintenance

**Examples**: "What's wrong with LSF?", "How to optimize fuel mix?", "Show me kiln SOP"`

    }
    
    if (input.includes('maintenance') || input.includes('repair')) {
      return `🔧 **Maintenance Insights**

**Current Equipment Status**:
• Kiln: Good condition, next inspection due in 30 days
• Mill: Bearing temperature elevated, monitor closely
• Cooler: Operating normally
• Preheater: Efficiency at 95%

**Upcoming Maintenance**:
• Mill bearing replacement: Scheduled in 2 weeks
• Kiln refractory inspection: Due next month
• Fan maintenance: Routine check in 1 week

**Recommendations**:
• Schedule mill maintenance during low production period
• Monitor mill vibration levels
• Prepare spare parts inventory

**Priority**: Mill bearing requires immediate attention.`
    }
    
    // Default response
    return `🤔 **Analysis Request Received**

I understand you're asking about: "${userInput}"

**Current Plant Status**:
• Specific Power: ${context.currentKPIs.specificPower} kWh/t
• Heat Rate: ${context.currentKPIs.heatRate} kcal/kg  
• LSF: ${context.currentKPIs.clinkerLSF}
• TSR: ${context.currentKPIs.tsr}%

**Autonomy Status**: ${context.autonomy ? 'Active' : 'Manual Mode'}

**Suggestions**:
• Try asking about specific KPIs (LSF, kiln temperature, power consumption)
• Request optimization recommendations
• Ask about maintenance schedules
• Inquire about SOPs or procedures

**Example**: "What's the current LSF status?" or "How can I optimize fuel consumption?"`
  }
  
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
      
      // Use enhanced mock response
      const mockResponse = getMockResponse(text, context)
      
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: mockResponse,
        timestamp: Date.now(),
      }
      
      setMessages((prev) => [...prev, reply])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
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


