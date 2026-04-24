import { ResultAsync } from './result-async.js'

export function fromThrowableAsync<A extends readonly unknown[], R, E> (
  fn: (...args: A) => Promise<R>,
  errorFn: (e: unknown) => E
): (...args: A) => ResultAsync<R, E> {
  return (...args: A): ResultAsync<R, E> =>
    ResultAsync.fromPromise(fn(...args), errorFn)
}
