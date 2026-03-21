import { ok, err } from './result.js'
import type { Result } from './result.js'

export function fromThrowable<A extends readonly unknown[], R> (
  fn: (...args: A) => R
): (...args: A) => Result<R, unknown>

export function fromThrowable<A extends readonly unknown[], R, E> (
  fn: (...args: A) => R,
  errorFn: (e: unknown) => E
): (...args: A) => Result<R, E>

export function fromThrowable<A extends readonly unknown[], R, E> (
  fn: (...args: A) => R,
  errorFn?: (e: unknown) => E
): (...args: A) => Result<R, E | unknown> {
  return (...args: A): Result<R, E | unknown> => {
    try {
      return ok(fn(...args))
    } catch (e: unknown) {
      return err(errorFn ? errorFn(e) : e)
    }
  }
}
