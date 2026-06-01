import { ok, err } from './result.js'
import type { Result } from './result.js'

export function fromNullable<T, E> (value: T | null | undefined, error: E): Result<NonNullable<T>, E> {
  if (value === null || value === undefined) return err(error)
  // Safe: we just verified the value is not null or undefined
  return ok(value as NonNullable<T>)
}
