import { ok, err } from './result.js'
import type { Result } from './result.js'

export function fromThrowable<A extends readonly unknown[], R, E> (
  fn: (...args: A) => R,
  errorFn: (e: unknown) => E
): (...args: A) => Result<R, E> {
  return (...args: A): Result<R, E> => {
    try {
      return ok(fn(...args))
    } catch (e: unknown) {
      return err(errorFn(e))
    }
  }
}
