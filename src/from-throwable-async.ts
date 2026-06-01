import { ResultAsync } from './result-async.js'
import { err } from './result.js'
import type { Caught, FnArgs } from './internal-types.js'

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
