import type { AuditEntry } from '../../types'
import './AuditHistory.css'

interface AuditHistoryProps {
  entries: AuditEntry[]
  auditError?: string | null
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export function AuditHistory({ entries, auditError = null }: AuditHistoryProps) {
  if (auditError) {
    return (
      <div className="audit-history">
        <p className="form-error" role="alert">
          History is unavailable: {auditError}
        </p>
      </div>
    )
  }

  const ordered = [...entries].sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt),
  )

  return (
    <details className="audit-history">
      <summary>History ({ordered.length})</summary>
      {ordered.length === 0 ? (
        <p className="audit-empty">
          No history recorded. Changes made before the audit trail existed are
          not listed.
        </p>
      ) : (
        <ol className="audit-list">
          {ordered.map((entry) => {
            const when = formatDateTime(entry.occurredAt)
            return (
              <li key={entry.id} className="audit-item">
                <p className="audit-summary">{entry.summary}</p>
                {entry.details && (
                  <p className="audit-details">{entry.details}</p>
                )}
                {when && <p className="audit-time">{when}</p>}
              </li>
            )
          })}
        </ol>
      )}
    </details>
  )
}
