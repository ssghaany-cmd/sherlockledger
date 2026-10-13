import { createId } from '../../lib/id'
import type { Claim } from '../../types'

export const CLAIM_TEXT_MIN = 10
export const CLAIM_TEXT_MAX = 1000
export const CLAIM_ORIGIN_MAX = 200

export interface ClaimInput {
  text: string
  origin: string
}

export interface ClaimFieldErrors {
  text?: string
  origin?: string
}

export interface ValidClaimInput {
  text: string
  origin?: string
}

export type ClaimValidation =
  | { valid: true; value: ValidClaimInput }
  | { valid: false; errors: ClaimFieldErrors }

export function validateClaimInput(input: ClaimInput): ClaimValidation {
  const text = input.text.trim()
  const origin = input.origin.trim()
  const errors: ClaimFieldErrors = {}

  if (text.length === 0) {
    errors.text = 'Enter the claim you want to check.'
  } else if (text.length < CLAIM_TEXT_MIN) {
    errors.text = `Describe the claim in at least ${CLAIM_TEXT_MIN} characters.`
  } else if (text.length > CLAIM_TEXT_MAX) {
    errors.text = `Use at most ${CLAIM_TEXT_MAX} characters for the claim.`
  }

  if (origin.length > CLAIM_ORIGIN_MAX) {
    errors.origin = `Use at most ${CLAIM_ORIGIN_MAX} characters for the origin.`
  }

  if (errors.text || errors.origin) {
    return { valid: false, errors }
  }
  return { valid: true, value: origin ? { text, origin } : { text } }
}

export function buildClaim(
  value: ValidClaimInput,
  now: Date = new Date(),
): Claim {
  const timestamp = now.toISOString()
  return {
    id: createId(),
    text: value.text,
    ...(value.origin ? { origin: value.origin } : {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}
