export const EVIDENCE_STANCES = ['supports', 'contradicts', 'neutral'] as const
export type EvidenceStance = (typeof EVIDENCE_STANCES)[number]

export const EVIDENCE_METHODS = ['manual', 'provider'] as const
export type EvidenceMethod = (typeof EVIDENCE_METHODS)[number]

export interface Evidence {
  id: string
  claimId: string
  sourceTitle: string
  sourceUrl?: string
  excerpt?: string
  stance: EvidenceStance
  method: EvidenceMethod
  providerName?: string
  addedAt: string
}
