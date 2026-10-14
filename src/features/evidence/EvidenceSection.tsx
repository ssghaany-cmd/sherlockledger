import type { Evidence, EvidenceStance } from '../../types'
import { EvidenceForm } from './EvidenceForm'
import { isHttpUrl } from './validation'
import './EvidenceSection.css'

interface EvidenceSectionProps {
  claimId: string
  evidence: Evidence[]
  evidenceError?: string | null
  onAdded: (evidence: Evidence) => void
}

const STANCE_LABELS: Record<EvidenceStance, string> = {
  supports: 'Supports',
  contradicts: 'Contradicts',
  neutral: 'Neutral',
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { dateStyle: 'medium' })
}

function describeMethod(item: Evidence): string {
  if (item.method === 'manual') return 'Added manually'
  return item.providerName ? `From ${item.providerName}` : 'From a provider'
}

export function EvidenceSection({
  claimId,
  evidence,
  evidenceError = null,
  onAdded,
}: EvidenceSectionProps) {
  if (evidenceError) {
    return (
      <div className="evidence-section">
        <p className="form-error" role="alert">
          Evidence is unavailable: {evidenceError}
        </p>
      </div>
    )
  }

  const ordered = [...evidence].sort((a, b) =>
    a.addedAt.localeCompare(b.addedAt),
  )

  return (
    <div className="evidence-section">
      <h3>Evidence ({ordered.length})</h3>

      {ordered.length === 0 ? (
        <p className="evidence-empty">No evidence recorded yet.</p>
      ) : (
        <ul className="evidence-list">
          {ordered.map((item) => {
            const added = formatDate(item.addedAt)
            return (
              <li key={item.id} className="evidence-item">
                <p className="evidence-title">
                  {item.sourceUrl && isHttpUrl(item.sourceUrl) ? (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.sourceTitle}
                    </a>
                  ) : (
                    item.sourceTitle
                  )}
                </p>
                {item.excerpt && (
                  <blockquote className="evidence-excerpt">
                    {item.excerpt}
                  </blockquote>
                )}
                <p className="evidence-meta">
                  <span className={`stance stance-${item.stance}`}>
                    {STANCE_LABELS[item.stance]}
                  </span>
                  <span>{describeMethod(item)}</span>
                  {added && <span>{added}</span>}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      <details className="evidence-add">
        <summary>Add evidence</summary>
        <EvidenceForm claimId={claimId} onAdded={onAdded} />
      </details>
    </div>
  )
}
