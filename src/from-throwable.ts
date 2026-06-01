import { ok, err } from './result.js'
import type { Result } from './result.js'
import type { Caught, FnArgs } from './internal-types.js'

/**
 * Wraps a synchronous function so that any thrown values are converted into typed `Err`s.
 *
 * This is the recommended way to safely call functions that might throw.
 * The `errorFn` receives a `Caught` value (anything that can be thrown).
 *
 * @param fn - The function to wrap.
 * @param errorFn - Maps any thrown value into your error type.
 * @returns A new function that returns `Result<T, E>`.
 */
export function fromThrowable<Args extends FnArgs, R, E> (
  fn: (...args: Args) => R,
  errorFn: (cause: Caught) => E
): (...args: Args) => Result<R, E> {
  return (...args: Args): Result<R, E> => {
    try {
      return ok(fn(...args))
    } catch (cause) {
      // Safe: Caught is intentionally the broadest possible type for thrown values
      return err(errorFn(cause as Caught))
    }
  }
}
