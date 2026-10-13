export type StorageErrorCode =
  | 'unavailable'
  | 'quota_exceeded'
  | 'corrupt_data'
  | 'not_found'
  | 'duplicate_id'

export interface StorageError {
  code: StorageErrorCode
  message: string
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: StorageError }

export function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

export function fail<T = never>(
  code: StorageErrorCode,
  message: string,
): Result<T> {
  return { ok: false, error: { code, message } }
}
