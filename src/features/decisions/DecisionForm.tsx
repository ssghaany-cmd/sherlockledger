import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { decisionsStore } from '../../lib/storage'
import type { Collection } from '../../lib/storage'
import type { Decision, Evidence, EvidenceStance } from '../../types'
import { buildDecision, validateDecisionInput } from './validation'
import type { DecisionFieldErrors } from './validation'

interface DecisionFormProps {
  claimId: string
  evidence: Evidence[]
  store?: Collection<Decision>
  onAdded?: (decision: Decision) => void
}

const STANCE_TEXT: Record<EvidenceStance, string> = {
  supports: 'supports',
  contradicts: 'contradicts',
  neutral: 'neutral',
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  )
}

export function DecisionForm({
  claimId,
  evidence,
  store = decisionsStore,
  onAdded,
}: DecisionFormProps) {
  const verdictId = useId()
  const evidenceGroupId = useId()
  const notesId = useId()
  const [verdict, setVerdict] = useState('')
  const [notes, setNotes] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [errors, setErrors] = useState<DecisionFieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const orderedEvidence = [...evidence].sort((a, b) =>
    a.addedAt.localeCompare(b.addedAt),
  )

  function toggleEvidence(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaveError(null)
    setSavedMessage(null)

    const validation = validateDecisionInput(
      { verdict, notes, evidenceIds: selected },
      evidence.map((item) => item.id),
    )
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})

    const decision = buildDecision(claimId, validation.value)
    const result = store.add(decision)
    if (!result.ok) {
      setSaveError(`Could not save the decision: ${result.error.message}`)
      return
    }

    setVerdict('')
    setNotes('')
    setSelected([])
    setSavedMessage('Decision recorded. The claim status now follows this decision.')
    onAdded?.(decision)
  }

  return (
    <form className="decision-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={verdictId}>Verdict</label>
        <select
          id={verdictId}
          value={verdict}
          onChange={(event) => setVerdict(event.target.value)}
          aria-invalid={errors.verdict ? true : undefined}
          aria-describedby={errors.verdict ? `${verdictId}-error` : undefined}
        >
          <option value="">Choose...</option>
          <option value="supported">Supported</option>
          <option value="contradicted">Contradicted</option>
          <option value="unverified">Unverified (not enough evidence)</option>
        </select>
        <FieldError id={`${verdictId}-error`} message={errors.verdict} />
      </div>

      <fieldset
        className="evidence-picker"
        aria-describedby={errors.evidenceIds ? `${evidenceGroupId}-error` : undefined}
      >
        <legend>Evidence this decision rests on</legend>
        {orderedEvidence.length === 0 ? (
          <p className="hint">
            No evidence yet. Add evidence above before marking this claim as
            supported or contradicted.
          </p>
        ) : (
          orderedEvidence.map((item) => (
            <label key={item.id} className="evidence-choice">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => toggleEvidence(item.id)}
              />
              <span>
                {item.sourceTitle} ({STANCE_TEXT[item.stance]})
              </span>
            </label>
          ))
        )}
        <FieldError id={`${evidenceGroupId}-error`} message={errors.evidenceIds} />
      </fieldset>

      <div className="field">
        <label htmlFor={notesId}>Reviewer notes</label>
        <textarea
          id={notesId}
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          aria-invalid={errors.notes ? true : undefined}
          aria-describedby={errors.notes ? `${notesId}-error` : undefined}
        />
        <FieldError id={`${notesId}-error`} message={errors.notes} />
      </div>

      {saveError && (
        <p className="form-error" role="alert">
          {saveError}
        </p>
      )}
      {savedMessage && (
        <p className="form-success" role="status">
          {savedMessage}
        </p>
      )}

      <button type="submit">Save decision</button>
    </form>
  )
}
