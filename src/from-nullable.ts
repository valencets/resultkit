import { ok, err } from './result.js'
import type { Result } from './result.js'

export function fromNullable<T, E> (value: T | null | undefined, error: E): Result<T, E> {
  return value === null || value === undefined ? err(error) : ok(value)
}
