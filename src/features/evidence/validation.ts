import { createId } from '../../lib/id'
import { EVIDENCE_STANCES } from '../../types'
import type { Evidence, EvidenceStance } from '../../types'

export const SOURCE_TITLE_MIN = 3
export const SOURCE_TITLE_MAX = 200
export const SOURCE_URL_MAX = 2000
export const EXCERPT_MAX = 1000

export interface EvidenceInput {
  sourceTitle: string
  sourceUrl: string
  excerpt: string
  stance: string
}

export interface EvidenceFieldErrors {
  sourceTitle?: string
  sourceUrl?: string
  excerpt?: string
  stance?: string
}

export interface ValidEvidenceInput {
  sourceTitle: string
  sourceUrl?: string
  excerpt?: string
  stance: EvidenceStance
}

export type EvidenceValidation =
  | { valid: true; value: ValidEvidenceInput }
  | { valid: false; errors: EvidenceFieldErrors }

function isStance(value: string): value is EvidenceStance {
  return (EVIDENCE_STANCES as readonly string[]).includes(value)
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateEvidenceInput(
  input: EvidenceInput,
): EvidenceValidation {
  const sourceTitle = input.sourceTitle.trim()
  const sourceUrl = input.sourceUrl.trim()
  const excerpt = input.excerpt.trim()
  const stance = input.stance
  const errors: EvidenceFieldErrors = {}

  if (sourceTitle.length === 0) {
    errors.sourceTitle = 'Enter the title of the source.'
  } else if (sourceTitle.length < SOURCE_TITLE_MIN) {
    errors.sourceTitle = `Use at least ${SOURCE_TITLE_MIN} characters for the title.`
  } else if (sourceTitle.length > SOURCE_TITLE_MAX) {
    errors.sourceTitle = `Use at most ${SOURCE_TITLE_MAX} characters for the title.`
  }

  if (sourceUrl.length > SOURCE_URL_MAX) {
    errors.sourceUrl = `Use at most ${SOURCE_URL_MAX} characters for the link.`
  } else if (sourceUrl && !isHttpUrl(sourceUrl)) {
    errors.sourceUrl = 'Enter a full link starting with http:// or https://.'
  }

  if (excerpt.length > EXCERPT_MAX) {
    errors.excerpt = `Use at most ${EXCERPT_MAX} characters for the excerpt.`
  }

  if (!isStance(stance)) {
    errors.stance = 'Choose whether the source supports, contradicts, or is neutral.'
  }

  if (Object.keys(errors).length > 0 || !isStance(stance)) {
    return { valid: false, errors }
  }

  const value: ValidEvidenceInput = { sourceTitle, stance }
  if (sourceUrl) value.sourceUrl = sourceUrl
  if (excerpt) value.excerpt = excerpt
  return { valid: true, value }
}

export function buildEvidence(
  claimId: string,
  value: ValidEvidenceInput,
  now: Date = new Date(),
): Evidence {
  return {
    id: createId(),
    claimId,
    sourceTitle: value.sourceTitle,
    ...(value.sourceUrl ? { sourceUrl: value.sourceUrl } : {}),
    ...(value.excerpt ? { excerpt: value.excerpt } : {}),
    stance: value.stance,
    method: 'manual',
    addedAt: now.toISOString(),
  }
}
