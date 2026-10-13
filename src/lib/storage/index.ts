import type { Claim, Decision, Evidence } from '../../types'
import { createCollection } from './collection'

export const claimsStore = createCollection<Claim>('sherlockledger:claims')
export const evidenceStore = createCollection<Evidence>(
  'sherlockledger:evidence',
)
export const decisionsStore = createCollection<Decision>(
  'sherlockledger:decisions',
)

export { createCollection } from './collection'
export type { Collection } from './collection'
export { ok, fail } from './result'
export type { Result, StorageError, StorageErrorCode } from './result'
