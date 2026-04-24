import { ResultAsync } from './result-async.js'

export type Result<T, E> = Ok<T, E> | Err<T, E>

export class Ok<T, E> {
  readonly value: T

  constructor (value: T) {
    this.value = value
  }

  isOk (): this is Ok<T, E> {
    return true
  }

  isErr (): this is Err<T, E> {
    return false
  }

  map<U> (fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value))
  }

  mapErr<F> (_fn: (error: E) => F): Result<T, F> {
    return this as unknown as Ok<T, F>
  }

  andThen<U, F> (fn: (value: T) => Result<U, F>): Result<U, E | F> {
    return fn(this.value)
  }

  orElse<U, F> (_fn: (error: E) => Result<U, F>): Result<T | U, F> {
    return this as unknown as Ok<T, F>
  }

  match<A, B = A> (okFn: (value: T) => A, _errFn: (error: E) => B): A | B {
    return okFn(this.value)
  }

  unwrapOr<A> (_defaultValue: A): T | A {
    return this.value
  }

  unwrap (): T {
    return this.value
  }

  unwrapErr (): never {
    // eslint-disable-next-line no-restricted-syntax
    throw new Error('Called unwrapErr on an Ok value', { cause: this.value })
  }

  toAsync (): ResultAsync<T, E> {
    return new ResultAsync(Promise.resolve(this as Result<T, E>))
  }
}

export class Err<T, E> {
  readonly error: E

  constructor (error: E) {
    this.error = error
  }

  isOk (): this is Ok<T, E> {
    return false
  }

  isErr (): this is Err<T, E> {
    return true
  }

  map<U> (_fn: (value: T) => U): Result<U, E> {
    return this as unknown as Err<U, E>
  }

  mapErr<F> (fn: (error: E) => F): Result<T, F> {
    return new Err(fn(this.error))
  }

  andThen<U, F> (_fn: (value: T) => Result<U, F>): Result<U, E | F> {
    return this as unknown as Err<U, E | F>
  }

  orElse<U, F> (fn: (error: E) => Result<U, F>): Result<T | U, F> {
    return fn(this.error)
  }

  match<A, B = A> (_okFn: (value: T) => A, errFn: (error: E) => B): A | B {
    return errFn(this.error)
  }

  unwrapOr<A> (defaultValue: A): T | A {
    return defaultValue
  }

  unwrap (): never {
    const suffix = typeof this.error === 'string' ? `: ${this.error}` : ''
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`Called unwrap on an Err value${suffix}`, { cause: this.error })
  }

  unwrapErr (): E {
    return this.error
  }

  toAsync (): ResultAsync<T, E> {
    return new ResultAsync(Promise.resolve(this as Result<T, E>))
  }
}

export function ok<T, E = never> (value: T): Ok<T, E> {
  return new Ok(value)
}

export function err<T = never, E = unknown> (error: E): Err<T, E> {
  return new Err(error)
}
