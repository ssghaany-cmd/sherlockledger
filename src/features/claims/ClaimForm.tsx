import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { claimsStore } from '../../lib/storage'
import type { Collection } from '../../lib/storage'
import type { Claim } from '../../types'
import { buildClaim, validateClaimInput } from './validation'
import type { ClaimFieldErrors } from './validation'

interface ClaimFormProps {
  store?: Collection<Claim>
  onCreated?: (claim: Claim) => void
}

export function ClaimForm({ store = claimsStore, onCreated }: ClaimFormProps) {
  const textId = useId()
  const originId = useId()
  const [text, setText] = useState('')
  const [origin, setOrigin] = useState('')
  const [errors, setErrors] = useState<ClaimFieldErrors>({})
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavedMessage(null)
    setSaveError(null)

    const validation = validateClaimInput({ text, origin })
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }
    setErrors({})

    const claim = buildClaim(validation.value)
    const result = store.add(claim)
    if (!result.ok) {
      setSaveError(`Could not save the claim: ${result.error.message}`)
      return
    }

    setText('')
    setOrigin('')
    setSavedMessage(
      'Claim saved. It stays unverified until a decision is recorded.',
    )
    onCreated?.(claim)
  }

  return (
    <form className="claim-form" onSubmit={handleSubmit} noValidate>
      <h2>Add a claim</h2>

      <div className="field">
        <label htmlFor={textId}>Claim to check</label>
        <textarea
          id={textId}
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          aria-invalid={errors.text ? true : undefined}
          aria-describedby={errors.text ? `${textId}-error` : undefined}
        />
        {errors.text && (
          <p id={`${textId}-error`} className="field-error" role="alert">
            {errors.text}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={originId}>Where did it come from? (optional)</label>
        <input
          id={originId}
          type="text"
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
          aria-invalid={errors.origin ? true : undefined}
          aria-describedby={errors.origin ? `${originId}-error` : undefined}
        />
        {errors.origin && (
          <p id={`${originId}-error`} className="field-error" role="alert">
            {errors.origin}
          </p>
        )}
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

      <button type="submit">Save claim</button>
    </form>
  )
}
