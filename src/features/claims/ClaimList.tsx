import { DecisionSection } from '../decisions/DecisionSection'
import { EvidenceSection } from '../evidence/EvidenceSection'
import type { Claim, Decision, Evidence } from '../../types'
import { VERDICT_LABELS, getClaimStatus } from './status'
import './ClaimList.css'

interface ClaimListProps {
  claims: Claim[]
  decisions: Decision[]
  decisionsError?: string | null
  evidence: Evidence[]
  evidenceError?: string | null
  onEvidenceAdded: (evidence: Evidence) => void
  onDecisionAdded: (decision: Decision) => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function describeStatus(
  claim: Claim,
  decisions: Decision[],
  decisionsError: string | null,
): { label: string; tone: string } {
  if (decisionsError) {
    return { label: 'Status unavailable', tone: 'unavailable' }
  }
  const status = getClaimStatus(claim.id, decisions)
  return {
    label: status.decided
      ? VERDICT_LABELS[status.verdict]
      : 'Unverified (no decision yet)',
    tone: status.verdict,
  }
}

export function ClaimList({
  claims,
  decisions,
  decisionsError = null,
  evidence,
  evidenceError = null,
  onEvidenceAdded,
  onDecisionAdded,
}: ClaimListProps) {
  if (claims.length === 0) {
    return (
      <p className="empty">No claims yet. Add one above to start checking it.</p>
    )
  }

  const newestFirst = [...claims].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )

  return (
    <section className="claim-list" aria-label="Saved claims">
      <h2>Claims</h2>
      <ul>
        {newestFirst.map((claim) => {
          const { label, tone } = describeStatus(claim, decisions, decisionsError)
          const added = formatDate(claim.createdAt)
          const claimEvidence = evidence.filter(
            (item) => item.claimId === claim.id,
          )
          const claimDecisions = decisions.filter(
            (item) => item.claimId === claim.id,
          )
          return (
            <li key={claim.id} className="claim-item">
              <p className="claim-text">{claim.text}</p>
              <p className="claim-meta">
                <span className={`badge badge-${tone}`}>{label}</span>
                {claim.origin && <span>From: {claim.origin}</span>}
                {added && <span>Added {added}</span>}
              </p>
              <EvidenceSection
                claimId={claim.id}
                evidence={claimEvidence}
                evidenceError={evidenceError}
                onAdded={onEvidenceAdded}
              />
              <DecisionSection
                claimId={claim.id}
                decisions={claimDecisions}
                evidence={claimEvidence}
                decisionsError={decisionsError}
                evidenceError={evidenceError}
                onAdded={onDecisionAdded}
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
