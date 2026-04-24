import { ok, err } from './result.js'
import type { Result } from './result.js'

export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  private readonly _promise: Promise<Result<T, E>>

  constructor (promise: Promise<Result<T, E>>) {
    this._promise = promise
  }

  static fromPromise<T, E> (
    promise: PromiseLike<T>,
    errorFn: (e: unknown) => E
  ): ResultAsync<T, E> {
    return new ResultAsync(
      Promise.resolve(promise).then(
        (value) => ok<T, E>(value),
        (e: unknown) => err<T, E>(errorFn(e))
      )
    )
  }

  static fromSafePromise<T, E = never> (
    promise: PromiseLike<T>
  ): ResultAsync<T, E> {
    return new ResultAsync(
      Promise.resolve(promise).then((value) => ok<T, E>(value))
    )
  }

  map<U> (fn: (value: T) => U | Promise<U>): ResultAsync<U, E> {
    return new ResultAsync(
      this._promise.then(async (result) => {
        if (result.isErr()) {
          return err<U, E>(result.error)
        }
        try {
          const mapped = fn(result.value)
          const resolved = mapped instanceof Promise ? await mapped : mapped
          return ok<U, E>(resolved)
        } catch (e) {
          return err<U, E>(e as E)
        }
      })
    )
  }

  mapErr<F> (fn: (error: E) => F | Promise<F>): ResultAsync<T, F> {
    return new ResultAsync(
      this._promise.then(async (result) => {
        if (result.isOk()) {
          return ok<T, F>(result.value)
        }
        try {
          const mapped = fn(result.error)
          const resolved = mapped instanceof Promise ? await mapped : mapped
          return err<T, F>(resolved)
        } catch (e) {
          return err<T, F>(e as F)
        }
      })
    )
  }

  andThen<U, F> (
    fn: (value: T) => Result<U, F> | ResultAsync<U, F>
  ): ResultAsync<U, E | F> {
    return new ResultAsync(
      this._promise.then((result) => {
        if (result.isErr()) {
          return err<U, E | F>(result.error)
        }
        try {
          const next = fn(result.value)
          if (next instanceof ResultAsync) {
            return next._promise
          }
          return next as Result<U, E | F>
        } catch (e) {
          return err<U, E | F>(e as E | F)
        }
      })
    )
  }

  orElse<U, F> (
    fn: (error: E) => Result<U, F> | ResultAsync<U, F>
  ): ResultAsync<T | U, F> {
    return new ResultAsync(
      this._promise.then((result) => {
        if (result.isOk()) {
          return ok<T | U, F>(result.value)
        }
        try {
          const next = fn(result.error)
          if (next instanceof ResultAsync) {
            return next._promise
          }
          return next as Result<T | U, F>
        } catch (e) {
          return err<T | U, F>(e as F)
        }
      })
    )
  }

  async match<A, B = A> (
    okFn: (value: T) => A,
    errFn: (error: E) => B
  ): Promise<A | B> {
    const result = await this._promise
    if (result.isOk()) {
      return okFn(result.value)
    }
    return errFn(result.error)
  }

  async unwrapOr<A> (defaultValue: A): Promise<T | A> {
    const result = await this._promise
    if (result.isOk()) {
      return result.value
    }
    return defaultValue
  }

  then<A, B> (
    onFulfilled?: ((result: Result<T, E>) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: unknown) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    return this._promise.then(onFulfilled, onRejected)
  }
}

export function okAsync<T, E = never> (value: T): ResultAsync<T, E> {
  return new ResultAsync(Promise.resolve(ok<T, E>(value)))
}

export function errAsync<T = never, E = unknown> (error: E): ResultAsync<T, E> {
  return new ResultAsync(Promise.resolve(err<T, E>(error)))
}
