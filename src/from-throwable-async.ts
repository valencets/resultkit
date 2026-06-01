import { ResultAsync } from './result-async.js'
import { err } from './result.js'
import type { Caught, FnArgs } from './internal-types.js'

/**
 * Wraps a function (sync or async) so that any thrown/rejected values are converted into typed `Err`s.
 *
 * The `errorFn` receives a `Caught` value for both synchronous throws and promise rejections.
 *
 * @param fn - The function to wrap. Can return a value or a Promise.
 * @param errorFn - Maps any thrown or rejected value into your error type.
 */
export function fromThrowableAsync<Args extends FnArgs, R, E> (
  fn: (...args: Args) => Promise<R>,
  errorFn: (cause: Caught) => E
): (...args: Args) => ResultAsync<R, E> {
  return (...args: Args): ResultAsync<R, E> => {
    try {
      return ResultAsync.fromPromise(fn(...args), errorFn)
    } catch (cause) {
      return new ResultAsync(Promise.resolve(err<R, E>(errorFn(cause as Caught))))
    }
  }
}
