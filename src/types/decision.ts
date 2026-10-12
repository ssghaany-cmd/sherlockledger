export const VERDICTS = ['supported', 'contradicted', 'unverified'] as const
export type Verdict = (typeof VERDICTS)[number]

export interface Decision {
  id: string
  claimId: string
  verdict: Verdict
  notes: string
  evidenceIds: string[]
  decidedAt: string
}
