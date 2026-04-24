import { ResultAsync } from './result-async.js'

export function fromThrowableAsync<A extends readonly unknown[], R> (
  fn: (...args: A) => Promise<R>
): (...args: A) => ResultAsync<R, unknown>

export function fromThrowableAsync<A extends readonly unknown[], R, E> (
  fn: (...args: A) => Promise<R>,
  errorFn: (e: unknown) => E
): (...args: A) => ResultAsync<R, E>

export function fromThrowableAsync<A extends readonly unknown[], R, E> (
  fn: (...args: A) => Promise<R>,
  errorFn?: (e: unknown) => E
): (...args: A) => ResultAsync<R, E | unknown> {
  return (...args: A): ResultAsync<R, E | unknown> =>
    ResultAsync.fromPromise(fn(...args), errorFn ?? ((e) => e))
}
