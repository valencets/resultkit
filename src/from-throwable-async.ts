import { err, ok } from './result.js'
import { ResultAsync, __createResultAsync } from './result-async.js'
import type { Caught, FnArgs } from './internal-types.js'
import type { Result } from './result.js'

/**
 * Wraps a function (sync or async) so that any thrown/rejected values are converted into typed `Err`s.
 *
 * The `errorFn` receives a `Caught` value for both synchronous throws and promise rejections.
 *
 * @param fn - The function to wrap. Can return a value or a Promise.
 * @param errorFn - Maps any thrown or rejected value into your error type.
 */
export function fromThrowableAsync<Args extends FnArgs, T, E> (
  fn: (...args: Args) => T | PromiseLike<T>,
  errorFn: (cause: Caught) => E
): (...args: Args) => ResultAsync<T, E> {
  return (...args: Args) => __createResultAsync(resolveThrowable(fn, errorFn, args))
}

async function resolveThrowable<Args extends FnArgs, T, E> (
  fn: (...args: Args) => T | PromiseLike<T>,
  errorFn: (cause: Caught) => E,
  args: Args
): Promise<Result<T, E>> {
  try {
    return ok(await fn(...args))
  } catch (cause) {
    // Safe: Caught is intentionally the broadest possible type for thrown values
    return err(errorFn(cause as Caught))
  }
}
