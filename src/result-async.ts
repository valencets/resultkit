import { ok, err } from './result.js'
import type { Result } from './result.js'
import type { Caught } from './internal-types.js'

/**
 * An async Result that is also `PromiseLike<Result<T, E>>`.
 *
 * Most transformation methods assume the callbacks do **not** throw.
 * Use the containment helpers (`fromThrowableAsync`, `fromPromise`) at unsafe boundaries.
 */
export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  private readonly _promise: Promise<Result<T, E>>

  private constructor (promise: Promise<Result<T, E>>) {
    this._promise = promise
  }

  /** @internal */
  static __internalCreate<T, E> (promise: Promise<Result<T, E>>): ResultAsync<T, E> {
    return new ResultAsync(promise)
  }

  /**
   * Wraps a promise and converts rejections into a typed `Err`.
   *
   * This is the primary safe way to bring external async work into the Result world.
   *
   * @param promise - The promise to wrap.
   * @param errorFn - Function that converts any rejection into your error type.
   */
  static fromPromise<T, E> (
    promise: PromiseLike<T>,
    errorFn: (cause: Caught) => E
  ): ResultAsync<T, E> {
    return __createResultAsync(
      Promise.resolve(promise).then(
        (value) => ok<T, E>(value),
        (cause: Caught) => err<T, E>(errorFn(cause))
      )
    )
  }

  /**
   * Wraps a promise that is expected to never reject.
   *
   * Only use this when you are certain the promise cannot reject.
   * If it does reject, the rejection will escape unhandled.
   */
  static fromSafePromise<T, E = never> (
    promise: PromiseLike<T>
  ): ResultAsync<T, E> {
    return __createResultAsync(
      Promise.resolve(promise).then((value) => ok<T, E>(value))
    )
  }

  /**
   * Transforms the successful value.
   *
   * @throws This method does **not** catch exceptions. The mapper must not throw.
   * Use `.andThen()` + explicit `err()`/`errAsync()`, or wrap fallible work with
   * `fromThrowableAsync`.
   */
  map<U> (fn: (value: T) => U | PromiseLike<U>): ResultAsync<U, E> {
    return __createResultAsync(
      this._promise.then(async (result) => {
        if (result.isErr()) {
          return err<U, E>(result.error)
        }
        // Always await (Promise.resolve handles plain values + any PromiseLike uniformly).
        const resolved = await fn(result.value)
        return ok<U, E>(resolved)
      })
    )
  }

  /**
   * Transforms the error value.
   *
   * @throws This method does **not** catch exceptions. The mapper must not throw.
   * Use `.andThen()` + explicit `err()`/`errAsync()`, or wrap fallible work with
   * `fromThrowableAsync`.
   */
  mapErr<F> (fn: (error: E) => F | PromiseLike<F>): ResultAsync<T, F> {
    return __createResultAsync(
      this._promise.then(async (result) => {
        if (result.isOk()) {
          return ok<T, F>(result.value)
        }
        // Always await (Promise.resolve handles plain values + any PromiseLike uniformly).
        const resolved = await fn(result.error)
        return err<T, F>(resolved)
      })
    )
  }

  /**
   * Chains a fallible operation that returns another Result or ResultAsync.
   *
   * @throws This method does **not** catch exceptions. The callback must not throw.
   * Return an explicit `err()` / `errAsync()` for failures instead of throwing.
   */
  andThen<U, F> (
    fn: (value: T) => Result<U, F> | ResultAsync<U, F>
  ): ResultAsync<U, E | F> {
    return __createResultAsync(
      this._promise.then((result) => {
        if (result.isErr()) {
          return err<U, E | F>(result.error)
        }
        const next = fn(result.value)
        if (next instanceof ResultAsync) {
          // Allowed internal peek at the settled promise for chaining.
          // This is the main remaining direct field access after the factory discipline cleanup.
          return next._promise
        }
        return next as Result<U, E | F>
      })
    )
  }

  /**
   * Provides a recovery Result when the current value is an Err.
   *
   * @throws This method does **not** catch exceptions. The callback must not throw.
   * Return an explicit `err()` / `errAsync()` for failures instead of throwing.
   */
  orElse<U, F> (
    fn: (error: E) => Result<U, F> | ResultAsync<U, F>
  ): ResultAsync<T | U, F> {
    return __createResultAsync(
      this._promise.then((result) => {
        if (result.isOk()) {
          return ok<T | U, F>(result.value)
        }
        const next = fn(result.error)
        if (next instanceof ResultAsync) {
          // Allowed internal peek at the settled promise for chaining.
          // This is the main remaining direct field access after the factory discipline cleanup.
          return next._promise
        }
        return next as Result<T | U, F>
      })
    )
  }

  /**
   * Runs a side-effect callback on the success value (fire-and-forget).
   *
   * The callback must **not** throw. Throwing will cause the returned
   * ResultAsync's promise to reject (consistent with the strict mapper contract
   * introduced in this version). For fallible side effects, wrap with
   * `fromThrowable` / `fromThrowableAsync` or use `.andThen()`.
   */
  tap (fn: (value: T) => void): ResultAsync<T, E> {
    return __createResultAsync(
      this._promise.then((result) => {
        if (result.isOk()) fn(result.value)
        return result
      })
    )
  }

  /**
   * Runs a side-effect callback on the error value (fire-and-forget).
   *
   * The callback must **not** throw. Throwing will cause the returned
   * ResultAsync's promise to reject (consistent with the strict mapper contract
   * introduced in this version). For fallible side effects, wrap with
   * `fromThrowable` / `fromThrowableAsync` or use `.orElse()`.
   */
  tapErr (fn: (error: E) => void): ResultAsync<T, E> {
    return __createResultAsync(
      this._promise.then((result) => {
        if (result.isErr()) fn(result.error)
        return result
      })
    )
  }

  async match<A, B = A> (
    okFn: (value: T) => A,
    errFn: (error: E) => B
  ): Promise<A | B>
  async match<A, B = A> (
    handlers: { ok: (value: T) => A, err: (error: E) => B }
  ): Promise<A | B>
  async match<A, B = A> (
    okFnOrHandlers: ((value: T) => A) | { ok: (value: T) => A, err: (error: E) => B },
    errFn?: (error: E) => B
  ): Promise<A | B> {
    const result = await this._promise
    if (typeof okFnOrHandlers === 'function') {
      return result.isOk() ? okFnOrHandlers(result.value) : errFn!(result.error)
    }
    return result.isOk() ? okFnOrHandlers.ok(result.value) : okFnOrHandlers.err(result.error)
  }

  async unwrap (): Promise<T> {
    const result = await this._promise
    return result.unwrap()
  }

  async unwrapErr (): Promise<E> {
    const result = await this._promise
    return result.unwrapErr()
  }

  async unwrapOr<A> (defaultValue: A): Promise<T | A> {
    const result = await this._promise
    if (result.isOk()) {
      return result.value
    }
    return defaultValue
  }

  /**
   * Standard Promise `.then` implementation.
   * Rejection reasons are typed as `Caught`.
   */
  then<A, B> (
    onFulfilled?: ((result: Result<T, E>) => A | PromiseLike<A>) | null,
    onRejected?: ((reason: Caught) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    return this._promise.then(onFulfilled, onRejected)
  }
}

/**
 * Creates a successful `ResultAsync`.
 */
export function okAsync<T, E = never> (value: T): ResultAsync<T, E> {
  return __createResultAsync(Promise.resolve(ok<T, E>(value)))
}

/**
 * Creates a failed `ResultAsync`.
 * The error type defaults to `Caught` (anything that can be thrown or serialized).
 */
export function errAsync<T = never, E = Caught> (error: E): ResultAsync<T, E> {
  return __createResultAsync(Promise.resolve(err<T, E>(error)))
}

/**
 * Internal-only factory for creating ResultAsync instances.
 * All package-internal code should use this instead of `new ResultAsync(...)`.
 */
export function __createResultAsync<T, E> (promise: Promise<Result<T, E>>): ResultAsync<T, E> {
  return ResultAsync.__internalCreate(promise)
}
