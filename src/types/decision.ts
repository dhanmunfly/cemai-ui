export type ProposalAgent = 'guardian' | 'optimizer'

export interface Proposal {
  id: string
  agent: ProposalAgent
  title: string
  description: string
  adjustments: Record<string, number>
  predictedImpact: Record<string, number>
  confidence: number // 0..1
}

export interface MasterSynthesis {
  summary: string
  rationale: string
  recommendedAdjustments: Record<string, number>
}

export interface DecisionPayload {
  id: string
  guardian: Proposal
  optimizer: Proposal
  synthesis: MasterSynthesis
  createdAt: string
}


