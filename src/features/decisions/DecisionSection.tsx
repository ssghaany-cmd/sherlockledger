import type { Decision, Evidence } from '../../types'
import { VERDICT_LABELS } from '../claims/status'
import { DecisionForm } from './DecisionForm'
import './DecisionSection.css'

interface DecisionSectionProps {
  claimId: string
  decisions: Decision[]
  evidence: Evidence[]
  decisionsError?: string | null
  evidenceError?: string | null
  onAdded: (decision: Decision) => void
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function DecisionSection({
  claimId,
  decisions,
  evidence,
  decisionsError = null,
  evidenceError = null,
  onAdded,
}: DecisionSectionProps) {
  if (decisionsError) {
    return (
      <div className="decision-section">
        <p className="form-error" role="alert">
          Decisions are unavailable: {decisionsError}
        </p>
      </div>
    )
  }

  const newestFirst = [...decisions].sort((a, b) =>
    b.decidedAt.localeCompare(a.decidedAt),
  )
  const titles = new Map(evidence.map((item) => [item.id, item.sourceTitle]))

  return (
    <div className="decision-section">
      <h3>Decisions ({newestFirst.length})</h3>

      {newestFirst.length === 0 ? (
        <p className="decision-empty">
          No decision recorded yet. The claim stays unverified.
        </p>
      ) : (
        <ul className="decision-list">
          {newestFirst.map((decision, index) => {
            const sources = decision.evidenceIds
              .map((id) => titles.get(id))
              .filter((title): title is string => Boolean(title))
            const when = formatDateTime(decision.decidedAt)
            return (
              <li key={decision.id} className="decision-item">
                <p className="decision-head">
                  <span className={`badge badge-${decision.verdict}`}>
                    {VERDICT_LABELS[decision.verdict]}
                  </span>
                  {index === 0 && <span className="current-tag">Current</span>}
                  {when && <span>{when}</span>}
                </p>
                <p className="decision-notes">{decision.notes}</p>
                {sources.length > 0 && (
                  <p className="decision-sources">
                    Based on: {sources.join('; ')}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {evidenceError ? (
        <p className="form-error" role="alert">
          Evidence could not be loaded, so new decisions cannot be recorded
          right now.
        </p>
      ) : (
        <details className="decision-add">
          <summary>Record decision</summary>
          <DecisionForm claimId={claimId} evidence={evidence} onAdded={onAdded} />
        </details>
      )}
    </div>
  )
}
