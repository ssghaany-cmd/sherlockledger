import { getLocalStorage } from './browserStorage'
import { fail, ok } from './result'
import type { Result } from './result'

export interface Collection<T extends { id: string }> {
  list(): Result<T[]>
  getById(id: string): Result<T>
  add(item: T): Result<T>
  update(item: T): Result<T>
}

type StorageGetter = () => Storage | null

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22)
  )
}

function hasStringId(value: unknown): value is { id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string'
  )
}

export function createCollection<T extends { id: string }>(
  key: string,
  getStorage: StorageGetter = getLocalStorage,
): Collection<T> {
  function read(): Result<T[]> {
    const storage = getStorage()
    if (!storage) {
      return fail('unavailable', 'Browser storage is not available.')
    }

    let raw: string | null
    try {
      raw = storage.getItem(key)
    } catch {
      return fail('unavailable', 'Browser storage could not be read.')
    }
    if (raw === null) return ok([])

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return fail('corrupt_data', `Stored data for "${key}" is not valid JSON.`)
    }
    if (!Array.isArray(parsed) || !parsed.every(hasStringId)) {
      return fail(
        'corrupt_data',
        `Stored data for "${key}" is not a list of records.`,
      )
    }
    return ok(parsed as T[])
  }

  function write(items: T[]): Result<T[]> {
    const storage = getStorage()
    if (!storage) {
      return fail('unavailable', 'Browser storage is not available.')
    }
    try {
      storage.setItem(key, JSON.stringify(items))
      return ok(items)
    } catch (error) {
      if (isQuotaError(error)) {
        return fail('quota_exceeded', 'Browser storage is full.')
      }
      return fail('unavailable', 'Browser storage could not be written.')
    }
  }

  return {
    list: read,

    getById(id) {
      const current = read()
      if (!current.ok) return current
      const found = current.value.find((item) => item.id === id)
      return found ? ok(found) : fail('not_found', `No record with id "${id}".`)
    },

    add(item) {
      const current = read()
      if (!current.ok) return current
      if (current.value.some((existing) => existing.id === item.id)) {
        return fail('duplicate_id', `A record with id "${item.id}" exists.`)
      }
      const saved = write([...current.value, item])
      return saved.ok ? ok(item) : saved
    },

    update(item) {
      const current = read()
      if (!current.ok) return current
      if (!current.value.some((existing) => existing.id === item.id)) {
        return fail('not_found', `No record with id "${item.id}".`)
      }
      const saved = write(
        current.value.map((existing) =>
          existing.id === item.id ? item : existing,
        ),
      )
      return saved.ok ? ok(item) : saved
    },
  }
}
