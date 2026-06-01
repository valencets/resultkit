import { ResultAsync } from './result-async.js'
import type { Caught, Value } from './internal-types.js'

/**
 * A successful result containing a value.
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

export class Ok<T, E> {
  /** The successful value. */
  readonly value: T

  constructor (value: T) {
    this.value = value
  }

  /** Type guard + narrows to Ok. */
  isOk (): this is Ok<T, E> {
    return true
  }

  /** Type guard + narrows to Err. */
  isErr (): this is Err<T, E> {
    return false
  }

  /** Maps over the success value. */
  map<U> (fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value))
  }

  /** Maps over the error (no-op on Ok). */
  mapErr<F> (_fn: (error: E) => F): Result<T, F> {
    return this as unknown as Ok<T, F>
  }

  /** Chains another Result-returning function. */
  andThen<U, F> (fn: (value: T) => Result<U, F>): Result<U, E | F> {
    return fn(this.value)
  }

  /** Provides a recovery Result on Err (no-op on Ok). */
  orElse<U, F> (_fn: (error: E) => Result<U, F>): Result<T | U, F> {
    return this as unknown as Ok<T, F>
  }

  /** Pattern match on the Result. */
  match<A, B = A> (okFn: (value: T) => A, _errFn: (error: E) => B): A | B
  match<A, B = A> (handlers: { ok: (value: T) => A, err: (error: E) => B }): A | B
  match<A, B = A> (
    okFnOrHandlers: ((value: T) => A) | { ok: (value: T) => A, err: (error: E) => B },
    _errFn?: (error: E) => B
  ): A | B {
    if (typeof okFnOrHandlers === 'function') return okFnOrHandlers(this.value)
    return okFnOrHandlers.ok(this.value)
  }

  /** Execute a side-effect on the value (for Ok). */
  tap (fn: (value: T) => void): this {
    fn(this.value)
    return this
  }

  /** No-op on Ok. */
  tapErr (_fn: (error: E) => void): this {
    return this
  }

  /** Return the value or a default. */
  unwrapOr<A> (_defaultValue: A): T | A {
    return this.value
  }

  /** Unwrap the success value. */
  unwrap (): T {
    return this.value
  }

  /** Always throws (this is Ok). */
  unwrapErr (): never {
    const suffix = getMessageSuffix(this.value as Value)
    throw new Error(`Called unwrapErr on an Ok value${suffix}`, { cause: this.value })
  }

  /** Convert to a ResultAsync. */
  toAsync (): ResultAsync<T, E> {
    return new ResultAsync(Promise.resolve(this as Result<T, E>))
  }
}

export class Err<T, E> {
  /** The error value. */
  readonly error: E

  constructor (error: E) {
    this.error = error
  }

  /** Type guard. */
  isOk (): this is Ok<T, E> {
    return false
  }

  /** Type guard + narrows to Err. */
  isErr (): this is Err<T, E> {
    return true
  }

  /** No-op on Err (maps over success). */
  map<U> (_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Err<U, E>
  }

  /** Maps over the error value. */
  mapErr<F> (fn: (error: E) => F): Result<T, F> {
    return new Err(fn(this.error))
  }

  /** No-op on Err (chains on success). */
  andThen<U, F> (_fn: (value: T) => Result<U, F>): Result<U, E | F> {
    return this as unknown as Err<U, E | F>
  }

  /** Chains a recovery function on Err. */
  orElse<U, F> (fn: (error: E) => Result<U, F>): Result<T | U, F> {
    return fn(this.error)
  }

  /** Pattern match. */
  match<A, B = A> (_okFn: (value: T) => A, errFn: (error: E) => B): A | B
  match<A, B = A> (handlers: { ok: (value: T) => A, err: (error: E) => B }): A | B
  match<A, B = A> (
    okFnOrHandlers: ((value: T) => A) | { ok: (value: T) => A, err: (error: E) => B },
    errFn?: (error: E) => B
  ): A | B {
    if (typeof okFnOrHandlers === 'function') return errFn!(this.error)
    return okFnOrHandlers.err(this.error)
  }

  /** No-op on Err. */
  tap (_fn: (value: T) => void): this {
    return this
  }

  /** Execute side-effect on the error. */
  tapErr (fn: (error: E) => void): this {
    fn(this.error)
    return this
  }

  /** Return a default on Err. */
  unwrapOr<A> (defaultValue: A): T | A {
    return defaultValue
  }

  /** Always throws on Err. */
  unwrap (): never {
    const suffix = getMessageSuffix(this.error as Value)
    throw new Error(`Called unwrap on an Err value${suffix}`, { cause: this.error })
  }

  /** Returns the error value. */
  unwrapErr (): E {
    return this.error
  }

  /** Convert to ResultAsync. */
  toAsync (): ResultAsync<T, E> {
    return new ResultAsync(Promise.resolve(this as Result<T, E>))
  }
}

function getMessageSuffix (value: Value): string {
  if (typeof value === 'string') {
    return `: ${value}`
  }
  // eslint-disable-next-line no-restricted-syntax -- intentional defensive fallback for error messages
  try {
    return `: ${JSON.stringify(value)}`
  } catch {
    return ''
  }
}

/**
 * Creates a successful `Ok` result.
 */
export function ok<T, E = never> (value: T): Ok<T, E> {
  return new Ok(value)
}

/**
 * Creates a failed `Err` result.
 * The error type defaults to `Caught` (anything that can be thrown or serialized).
 */
export function err<T = never, E = Caught> (error: E): Err<T, E> {
  return new Err(error)
}
