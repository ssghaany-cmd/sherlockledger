import { createId } from '../../lib/id'
import { auditStore } from '../../lib/storage'
import type { Collection, Result } from '../../lib/storage'
import { VERDICT_LABELS } from '../claims/status'
import type { AuditEntry, Claim, Decision, Evidence } from '../../types'

export type NewAuditEvent = Omit<AuditEntry, 'id' | 'occurredAt'>

export function claimCreatedEvent(claim: Claim): NewAuditEvent {
  return {
    claimId: claim.id,
    type: 'claim_created',
    summary: 'Claim created',
    ...(claim.origin ? { details: `Origin: ${claim.origin}` } : {}),
  }
}

export function evidenceAddedEvent(evidence: Evidence): NewAuditEvent {
  const method =
    evidence.method === 'manual' ? 'added manually' : 'from a provider'
  return {
    claimId: evidence.claimId,
    type: 'evidence_added',
    summary: `Evidence ${method}: ${evidence.sourceTitle} (${evidence.stance})`,
    ...(evidence.sourceUrl ? { details: evidence.sourceUrl } : {}),
  }
}

export function decisionRecordedEvent(decision: Decision): NewAuditEvent {
  return {
    claimId: decision.claimId,
    type: 'decision_recorded',
    summary: `Decision recorded: ${VERDICT_LABELS[decision.verdict]}`,
    details: decision.notes,
  }
}

export function recordAuditEvent(
  event: NewAuditEvent,
  store: Collection<AuditEntry> = auditStore,
  now: Date = new Date(),
): Result<AuditEntry> {
  return store.add({
    ...event,
    id: createId(),
    occurredAt: now.toISOString(),
  })
}
