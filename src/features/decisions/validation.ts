import { createId } from '../../lib/id'
import { VERDICTS } from '../../types'
import type { Decision, Verdict } from '../../types'

export const NOTES_MIN = 10
export const NOTES_MAX = 2000

export interface DecisionInput {
  verdict: string
  notes: string
  evidenceIds: string[]
}

export interface DecisionFieldErrors {
  verdict?: string
  notes?: string
  evidenceIds?: string
}

export interface ValidDecisionInput {
  verdict: Verdict
  notes: string
  evidenceIds: string[]
}

export type DecisionValidation =
  | { valid: true; value: ValidDecisionInput }
  | { valid: false; errors: DecisionFieldErrors }

function isVerdict(value: string): value is Verdict {
  return (VERDICTS as readonly string[]).includes(value)
}

export function validateDecisionInput(
  input: DecisionInput,
  availableEvidenceIds: string[],
): DecisionValidation {
  const verdict = input.verdict
  const notes = input.notes.trim()
  const evidenceIds = input.evidenceIds.filter((id) =>
    availableEvidenceIds.includes(id),
  )
  const errors: DecisionFieldErrors = {}

  if (!isVerdict(verdict)) {
    errors.verdict = 'Choose a verdict.'
  }

  if (notes.length === 0) {
    errors.notes = 'Explain the decision in the reviewer notes.'
  } else if (notes.length < NOTES_MIN) {
    errors.notes = `Use at least ${NOTES_MIN} characters in the reviewer notes.`
  } else if (notes.length > NOTES_MAX) {
    errors.notes = `Use at most ${NOTES_MAX} characters in the reviewer notes.`
  }

  if (isVerdict(verdict) && verdict !== 'unverified' && evidenceIds.length === 0) {
    errors.evidenceIds =
      'Select at least one piece of evidence to mark a claim as supported or contradicted. Add evidence first if there is none.'
  }

  if (Object.keys(errors).length > 0 || !isVerdict(verdict)) {
    return { valid: false, errors }
  }
  return { valid: true, value: { verdict, notes, evidenceIds } }
}

export function buildDecision(
  claimId: string,
  value: ValidDecisionInput,
  now: Date = new Date(),
): Decision {
  return {
    id: createId(),
    claimId,
    verdict: value.verdict,
    notes: value.notes,
    evidenceIds: value.evidenceIds,
    decidedAt: now.toISOString(),
  }
}
