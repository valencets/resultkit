import { ResultAsync } from './result-async.js'
import { err } from './result.js'

export function fromThrowableAsync<A extends readonly unknown[], R, E> (
  fn: (...args: A) => Promise<R>,
  errorFn: (e: unknown) => E
): (...args: A) => ResultAsync<R, E> {
  return (...args: A): ResultAsync<R, E> => {
    try {
      return ResultAsync.fromPromise(fn(...args), errorFn)
    } catch (e) {
      return new ResultAsync(Promise.resolve(err<R, E>(errorFn(e))))
    }
  }
}
