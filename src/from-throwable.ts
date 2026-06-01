import { ok, err } from './result.js'
import type { Result } from './result.js'
import type { Caught, FnArgs } from './internal-types.js'

/**
 * Wraps a function so that any thrown values are converted into typed Errs.
 * The errorFn receives a Caught value (anything that can be thrown).
 */
export function fromThrowable<Args extends FnArgs, R, E> (
  fn: (...args: Args) => R,
  errorFn: (cause: Caught) => E
): (...args: Args) => Result<R, E> {
  return (...args: Args): Result<R, E> => {
    try {
      return ok(fn(...args))
    } catch (cause) {
      return err(errorFn(cause as Caught))
    }
  }
}
