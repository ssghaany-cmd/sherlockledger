import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { evidenceStore } from '../../lib/storage'
import type { Collection } from '../../lib/storage'
import type { Evidence } from '../../types'
import { buildEvidence, validateEvidenceInput } from './validation'
import type { EvidenceFieldErrors } from './validation'

interface EvidenceFormProps {
  claimId: string
  store?: Collection<Evidence>
  onAdded?: (evidence: Evidence) => void
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="field-error" role="alert">
      {message}
    </p>
  )
}

export function EvidenceForm({
  claimId,
  store = evidenceStore,
  onAdded,
}: EvidenceFormProps) {
  const titleId = useId()
  const urlId = useId()
  const excerptId = useId()
  const stanceId = useId()
  const [sourceTitle, setSourceTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [stance, setStance] = useState('')
  const [errors, setErrors] = useState<EvidenceFieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaveError(null)
    setSavedMessage(null)

    const validation = validateEvidenceInput({
      sourceTitle,
      sourceUrl,
      excerpt,
      stance,
    })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})

    const evidence = buildEvidence(claimId, validation.value)
    const result = store.add(evidence)
    if (!result.ok) {
      setSaveError(`Could not save the evidence: ${result.error.message}`)
      return
    }

    setSourceTitle('')
    setSourceUrl('')
    setExcerpt('')
    setStance('')
    setSavedMessage(
      'Evidence saved as a manual entry. It does not change the claim status; only a decision does.',
    )
    onAdded?.(evidence)
  }

  return (
    <form className="evidence-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor={titleId}>Source title</label>
        <input
          id={titleId}
          type="text"
          value={sourceTitle}
          onChange={(event) => setSourceTitle(event.target.value)}
          aria-invalid={errors.sourceTitle ? true : undefined}
          aria-describedby={errors.sourceTitle ? `${titleId}-error` : undefined}
        />
        <FieldError id={`${titleId}-error`} message={errors.sourceTitle} />
      </div>

      <div className="field">
        <label htmlFor={urlId}>Link to the source (optional)</label>
        <input
          id={urlId}
          type="url"
          inputMode="url"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          aria-invalid={errors.sourceUrl ? true : undefined}
          aria-describedby={errors.sourceUrl ? `${urlId}-error` : undefined}
        />
        <FieldError id={`${urlId}-error`} message={errors.sourceUrl} />
      </div>

      <div className="field">
        <label htmlFor={excerptId}>Relevant excerpt (optional)</label>
        <textarea
          id={excerptId}
          rows={3}
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          aria-invalid={errors.excerpt ? true : undefined}
          aria-describedby={errors.excerpt ? `${excerptId}-error` : undefined}
        />
        <FieldError id={`${excerptId}-error`} message={errors.excerpt} />
      </div>

      <div className="field">
        <label htmlFor={stanceId}>What does this source say about the claim?</label>
        <select
          id={stanceId}
          value={stance}
          onChange={(event) => setStance(event.target.value)}
          aria-invalid={errors.stance ? true : undefined}
          aria-describedby={errors.stance ? `${stanceId}-error` : undefined}
        >
          <option value="">Choose...</option>
          <option value="supports">Supports the claim</option>
          <option value="contradicts">Contradicts the claim</option>
          <option value="neutral">Related but neutral</option>
        </select>
        <FieldError id={`${stanceId}-error`} message={errors.stance} />
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

      <button type="submit">Save evidence</button>
    </form>
  )
}
