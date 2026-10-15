export type AuditEventType =
  | 'claim_created'
  | 'evidence_added'
  | 'decision_recorded'

export interface AuditEntry {
  id: string
  claimId: string
  type: AuditEventType
  summary: string
  details?: string
  occurredAt: string
}
